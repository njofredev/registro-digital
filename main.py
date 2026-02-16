import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import date
import plotly.express as px
import io
import os

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Laboratorio Digital Tabancura", layout="wide", page_icon="🦷")

# --- ESTILOS PERSONALIZADOS (CSS) ---
st.markdown("""
    <style>
    .main { background-color: #f8f9fa; }
    .stMetric { background-color: #ffffff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    [data-testid="stForm"] { border: none; padding: 0; }
    </style>
    """, unsafe_allow_html=True)

# --- 1. DEFINICIÓN DE OPCIONES (Mantenidas del original) ---
OPCIONES_ESTADO = ["Solicitado", "En progreso", "Aceptado", "Entregado", "Fresado", "Diseñado", "Listo"]
OPCIONES_DOCTOR = ["Grace Martinson", "Pauline Heinriksen", "Francisca Corbalán", "David Sandoval", "Antonio Alvear", "José Acuña", "Sebastián Ortíz", "Antonia Pardo"]
OPCIONES_TONS = ["Sasha U.", "Martina T.", "Valentina S.", "Javiera P.", "Álvaro M.", "Millaray", "Isidora Q.", "Carolina H.", "Carolina S.", "SIN TONS", "Antonio Alvear", "Natalia A.", "TONS Tribunales", "Dr(a)"]
OPCIONES_SUCURSAL = ["Sucursal Los Tribunales", "Sucursal Vitacura"]
OPCIONES_MATERIAL = ["Disilicato A3", "Hibrido A3", "Híbrido A2", "Disilicato A2", "Disilicato A1", "Disilicato", "Híbrido A1", "PMMA"]
OPCIONES_DISENO = ["Modalidad Chairside", "Diseñado por David", "Diseñado por Pauline", "Diseñado por Antonio", "Diseñado por Grace", "Diseñado por Sebastian"]
OPCIONES_BLOQUES = ["1 bloque", "2 bloques", "3 bloques", "4 bloques", "5 o más bloques"]

# --- 2. CONEXIÓN A BASE DE DATOS ---
@st.cache_resource
def get_engine():
    # Intento de obtener credenciales desde entorno o secrets
    try:
        if "postgres" in st.secrets:
            pg = st.secrets["postgres"]
            url = f"postgresql://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
        else:
            url = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DATABASE')}"
        return create_engine(url, pool_pre_ping=True)
    except:
        return None

engine = get_engine()

# --- 3. FUNCIONES DE APOYO ---
def aplicar_colores(val):
    colores = {
        'Solicitado': 'background-color: #ffcccc; color: #990000;',
        'En progreso': 'background-color: #fff4cc; color: #996600;',
        'Aceptado': 'background-color: #e2f0d9; color: #385723;',
        'Entregado': 'background-color: #d9e2f3; color: #1f4e78;',
        'Fresado': 'background-color: #e1d5e7; color: #53315a;',
        'Diseñado': 'background-color: #dae8fc; color: #004085;',
        'Listo': 'background-color: #d4edda; color: #155724;'
    }
    return colores.get(val, '') + ' font-weight: bold; border-radius: 5px;'

def cargar_datos_formateados():
    if engine is None: return pd.DataFrame()
    try:
        df = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
        renombre = {
            'identificador': 'N° ID', 'fecha_ingreso': 'Fecha de ingreso',
            'estado': 'Estado', 'nombre_paciente': 'Nombre paciente',
            'doctor': 'Doctor', 'tons_a_cargo': 'Tons a cargo',
            'fecha_diseno': 'Diseño', 'fecha_fresado': 'Fresado',
            'fecha_entrega': 'Entrega', 'sucursal': 'Sucursal',
            'asunto_detalles': 'Detalles', 'material': 'Material',
            'diseno': 'Tipo Diseño', 'bloques_usados': 'Bloques'
        }
        return df.rename(columns=renombre)
    except: return pd.DataFrame()

# --- 4. SIDEBAR REESTRUCTURADO ---
with st.sidebar:
    try: st.image("logo.png", use_container_width=True)
    except: st.title("🦷 Lab Tabancura")
    
    st.markdown("### 🛠️ Gestión Rápida")
    st.info("Utilice las pestañas superiores para navegar entre los módulos del sistema.")
    
    st.divider()
    st.markdown(" **Hoy:** " + date.today().strftime("%d/%m/%Y"))

# --- 5. CUERPO PRINCIPAL ---
st.title("🦷 Registro Digital de Laboratorio")
st.markdown("---")

if engine is None:
    st.error("❌ Error crítico: No se pudo establecer conexión con la base de datos.")
    st.stop()

tabs = st.tabs([
    "➕ Nuevo Ingreso", 
    "🔍 Explorador", 
    "✏️ Modificar", 
    "📊 Análisis", 
    "📅 Agenda Entregas", 
    "📥 Reportes"
])

# --- PESTAÑA 1: INGRESO ---
with tabs[0]:
    st.subheader("Registrar Nuevo Trabajo")
    st.caption("Complete el formulario para dar de alta un nuevo caso clínico en el sistema.")
    
    # Lógica de ID automático mejorada
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT MAX(identificador) FROM registros")).scalar()
            siguiente_id = int(res) + 1 if res else 138
    except: siguiente_id = 138

    with st.expander("Formulario de Registro", expanded=True):
        with st.form("form_ingreso", clear_on_submit=True):
            c1, c2, c3 = st.columns([1, 2, 2])
            in_id = c1.number_input("N° ID", value=siguiente_id)
            in_f_ing = c2.date_input("Fecha de ingreso", value=date.today())
            in_est = c3.selectbox("Estado inicial", [""] + OPCIONES_ESTADO)

            st.markdown("#### Datos del Paciente y Clínico")
            c4, c5, c6 = st.columns(3)
            in_pac = c4.text_input("Nombre completo del paciente")
            in_doc = c5.selectbox("Doctor tratante", [""] + OPCIONES_DOCTOR)
            in_tons = c6.selectbox("Tons responsable", [""] + OPCIONES_TONS)

            st.markdown("#### Especificaciones Técnicas")
            c7, c8, c9 = st.columns(3)
            in_suc = c7.selectbox("Sucursal", [""] + OPCIONES_SUCURSAL)
            in_mat = c8.selectbox("Material seleccionado", [""] + OPCIONES_MATERIAL)
            in_blo = c9.selectbox("Cantidad de bloques", [""] + OPCIONES_BLOQUES)

            in_dis = st.selectbox("Modalidad de diseño", [""] + OPCIONES_DISENO)
            in_det = st.text_area("Instrucciones o detalles adicionales")

            st.markdown("#### Planificación")
            c10, c11, c12 = st.columns(3)
            in_f_dis = c10.date_input("Fecha Diseño Est.", value=None)
            in_f_fre = c11.date_input("Fecha Fresado Est.", value=None)
            in_f_ent = c12.date_input("Fecha Entrega Prometida", value=None)

            if st.form_submit_button("💾 GUARDAR REGISTRO", use_container_width=True):
                if not in_pac or not in_est:
                    st.warning("⚠️ El nombre del paciente y el estado son obligatorios.")
                else:
                    with engine.begin() as conn:
                        query = text("""INSERT INTO registros (identificador, fecha_ingreso, estado, nombre_paciente, doctor, tons_a_cargo, fecha_diseno, fecha_fresado, fecha_entrega, sucursal, material, diseno, asunto_detalles, bloques_usados) 
                                        VALUES (:id, :fi, :es, :pa, :do, :to, :fd, :ff, :fe, :su, :ma, :di, :de, :bl)""")
                        conn.execute(query, {"id":in_id, "fi":str(in_f_ing), "es":in_est, "pa":in_pac, "do":in_doc, "to":in_tons, "fd":str(in_f_dis), "ff":str(in_f_fre), "fe":str(in_f_ent), "su":in_suc, "ma":in_mat, "di":in_dis, "de":in_det, "bl":in_blo})
                    st.success(f"✅ Caso #{in_id} registrado correctamente.")
                    st.rerun()

# --- PESTAÑA 2: VISUALIZADOR ---
with tabs[1]:
    st.subheader("Listado de Trabajos")
    st.caption("Busque y filtre todos los casos registrados. La tabla se actualiza en tiempo real.")
    
    busq = st.text_input("🔍 Filtro rápido:", placeholder="Escriba nombre del paciente, doctor o ID...")
    df_v = cargar_datos_formateados()
    
    if not df_v.empty:
        if busq:
            mask = df_v.astype(str).apply(lambda x: x.str.contains(busq, case=False, na=False)).any(axis=1)
            df_v = df_v[mask]
        
        st.dataframe(
            df_v.style.map(aplicar_colores, subset=['Estado']), 
            use_container_width=True, 
            height=600
        )
    else:
        st.info("No hay registros que mostrar.")

# --- PESTAÑA 3: EDICIÓN ---
with tabs[2]:
    st.subheader("Gestión y Edición")
    st.caption("Seleccione un caso para actualizar su estado o corregir información.")
    
    df_e_raw = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
    if not df_e_raw.empty:
        sel_e = st.selectbox("Buscar caso por ID o Nombre:", ["Seleccione..."] + [f"{r['identificador']} - {r['nombre_paciente']}" for _, r in df_e_raw.iterrows()])
        
        if sel_e != "Seleccione...":
            id_ed = int(sel_e.split(" - ")[0])
            d = df_e_raw[df_e_raw['identificador'] == id_ed].iloc[0]
            
            with st.form("form_ed_total"):
                col_ed1, col_ed2 = st.columns(2)
                with col_ed1:
                    ed_pa = st.text_input("Nombre Paciente", value=str(d['nombre_paciente']))
                    ed_es = st.selectbox("Estado Actual", OPCIONES_ESTADO, index=OPCIONES_ESTADO.index(d['estado']) if d['estado'] in OPCIONES_ESTADO else 0)
                with col_ed2:
                    ed_do = st.selectbox("Doctor", OPCIONES_DOCTOR, index=OPCIONES_DOCTOR.index(d['doctor']) if d['doctor'] in OPCIONES_DOCTOR else 0)
                    ed_su = st.selectbox("Sucursal", OPCIONES_SUCURSAL, index=OPCIONES_SUCURSAL.index(d['sucursal']) if d['sucursal'] in OPCIONES_SUCURSAL else 0)
                
                ed_det = st.text_area("Notas", value=str(d['asunto_detalles'] or ""))
                
                c_btn1, c_btn2 = st.columns(2)
                if c_btn1.form_submit_button("🔄 ACTUALIZAR DATOS", use_container_width=True):
                    with engine.begin() as conn:
                        conn.execute(text("""UPDATE registros SET estado=:es, nombre_paciente=:pa, doctor=:doc, sucursal=:su, asunto_detalles=:de WHERE identificador=:id"""),
                                    {"es":ed_es, "pa":ed_pa, "doc":ed_do, "su":ed_su, "de":ed_det, "id":id_ed})
                    st.success("Cambios aplicados.")
                    st.rerun()
            
            with st.expander("⚠️ Zona de Peligro"):
                if st.button("🗑️ Eliminar este trabajo permanentemente", use_container_width=True):
                    with engine.begin() as conn: 
                        conn.execute(text("DELETE FROM registros WHERE identificador=:id"), {"id":id_ed})
                    st.rerun()

# --- PESTAÑA 4: DASHBOARD ---
with tabs[3]:
    st.subheader("Estadísticas de Productividad")
    st.caption("Resumen visual del flujo de trabajo y materiales utilizados.")
    
    df_db = cargar_datos_formateados()
    if not df_db.empty:
        m1, m2, m3 = st.columns(3)
        m1.metric("Total de Casos", len(df_db))
        m2.metric("Tons más activo", df_db['Tons a cargo'].mode()[0] if not df_db['Tons a cargo'].empty else "N/A")
        m3.metric("Material más usado", df_db['Material'].mode()[0] if not df_db['Material'].empty else "N/A")
        
        st.divider()
        g1, g2 = st.columns(2)
        fig_est = px.bar(df_db['Estado'].value_counts().reset_index(), x='Estado', y='count', color='Estado', title="Distribución por Estado")
        g1.plotly_chart(fig_est, use_container_width=True)
        
        fig_mat = px.pie(df_db, names='Material', title="Mix de Materiales", hole=0.4)
        g2.plotly_chart(fig_mat, use_container_width=True)

# --- PESTAÑA 5: ENTREGAS ---
with tabs[4]:
    st.subheader("Próximos Despachos")
    st.caption("Vista enfocada en los trabajos pendientes por entregar, ordenados cronológicamente.")
    
    df_p = cargar_datos_formateados()
    if not df_p.empty:
        df_p['f_dt_obj'] = pd.to_datetime(df_p['Entrega'], errors='coerce')
        pend = df_p[df_p['Estado'] != 'Entregado'].sort_values('f_dt_obj')
        st.dataframe(pend[['N° ID', 'Nombre paciente', 'Entrega', 'Estado', 'Sucursal', 'Doctor']], use_container_width=True)

# --- PESTAÑA 6: EXPORTACIÓN ---
with tabs[5]:
    st.subheader("Generación de Reportes")
    st.caption("Descargue la información en formato Excel o CSV para auditorías o respaldos externos.")
    
    df_ex = cargar_datos_formateados()
    with st.container(border=True):
        f_col1, f_col2 = st.columns(2)
        ex_suc = f_col1.multiselect("Filtrar por Sucursal:", OPCIONES_SUCURSAL, default=OPCIONES_SUCURSAL)
        ex_est = f_col2.multiselect("Filtrar por Estado:", OPCIONES_ESTADO, default=OPCIONES_ESTADO)
        
        df_final = df_ex[(df_ex['Sucursal'].isin(ex_suc)) & (df_ex['Estado'].isin(ex_est))]
        
        st.write(f"**Registros seleccionados:** {len(df_final)}")
        
        c_d1, c_d2 = st.columns(2)
        c_d1.download_button("📥 Descargar CSV", df_final.to_csv(index=False).encode('utf-8-sig'), "lab_tabancura.csv", use_container_width=True)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as wr:
            df_final.to_excel(wr, index=False, sheet_name='Reporte')
        c_d2.download_button("📊 Descargar Excel", output.getvalue(), "lab_tabancura.xlsx", use_container_width=True)