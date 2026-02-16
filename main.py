import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import date
import plotly.express as px
import io
import os

# --- 1. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Laboratorio Digital Tabancura", layout="wide", page_icon="🦷")

# CSS Normalizado para Dark/Light Mode
st.markdown("""
    <style>
    [data-testid="stMetric"] {
        border: 1px solid rgba(128, 128, 128, 0.2);
        padding: 15px;
        border-radius: 10px;
    }
    [data-testid="stForm"] {
        border: 1px solid rgba(128, 128, 128, 0.3);
        padding: 25px;
        border-radius: 12px;
    }
    .stCaption {
        font-size: 0.95rem;
        margin-bottom: 1rem;
    }
    </style>
    """, unsafe_allow_html=True)

# --- 2. OPCIONES DEL SISTEMA ---
OPCIONES_ESTADO = ["Solicitado", "En progreso", "Aceptado", "Entregado", "Fresado", "Diseñado", "Listo"]
OPCIONES_DOCTOR = ["Grace Martinson", "Pauline Heinriksen", "Francisca Corbalán", "David Sandoval", "Antonio Alvear", "José Acuña", "Sebastián Ortíz", "Antonia Pardo"]
OPCIONES_TONS = ["Sasha U.", "Martina T.", "Valentina S.", "Javiera P.", "Álvaro M.", "Millaray", "Isidora Q.", "Carolina H.", "Carolina S.", "SIN TONS", "Antonio Alvear", "Natalia A.", "TONS Tribunales", "Dr(a)"]
OPCIONES_SUCURSAL = ["Sucursal Los Tribunales", "Sucursal Vitacura"]
OPCIONES_MATERIAL = ["Disilicato A3", "Hibrido A3", "Híbrido A2", "Disilicato A2", "Disilicato A1", "Disilicato", "Híbrido A1", "PMMA"]
OPCIONES_DISENO = ["Modalidad Chairside", "Diseñado por David", "Diseñado por Pauline", "Diseñado por Antonio", "Diseñado por Grace", "Diseñado por Sebastian"]
OPCIONES_BLOQUES = ["1 bloque", "2 bloques", "3 bloques", "4 bloques", "5 o más bloques"]

# --- 3. CONEXIÓN A BASE DE DATOS ---
def get_engine():
    host = os.getenv("POSTGRES_HOST")
    if host:
        database, user, password = os.getenv("POSTGRES_DATABASE"), os.getenv("POSTGRES_USER"), os.getenv("POSTGRES_PASSWORD")
        port = os.getenv("POSTGRES_PORT", "5432")
    else:
        try:
            if "postgres" in st.secrets:
                pg = st.secrets["postgres"]
                host, database, user, password = pg.get("host"), pg.get("database"), pg.get("user"), pg.get("password")
                port = pg.get("port", "5432")
            else: return None
        except: return None
    if not host: return None
    try:
        url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        return create_engine(url, pool_pre_ping=True)
    except: return None

engine = get_engine()

# --- 4. UTILIDADES ---
def aplicar_colores(val):
    colores = {
        'Solicitado': 'background-color: rgba(255, 0, 0, 0.2); color: #ff4b4b;',
        'En progreso': 'background-color: rgba(255, 165, 0, 0.2); color: #ffa500;',
        'Aceptado': 'background-color: rgba(0, 128, 0, 0.2); color: #00ff00;',
        'Entregado': 'background-color: rgba(0, 0, 255, 0.2); color: #4b8bff;',
        'Fresado': 'background-color: rgba(128, 0, 128, 0.2); color: #d633ff;',
        'Diseñado': 'background-color: rgba(0, 255, 255, 0.1); color: #33e0ff;',
        'Listo': 'background-color: rgba(144, 238, 144, 0.2); color: #28a745;'
    }
    style = colores.get(val, '')
    return f'{style} font-weight: bold;' if style else ''

def cargar_datos():
    if engine is None: return pd.DataFrame()
    try:
        df = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
        renombre = {'identificador': 'N° ID', 'fecha_ingreso': 'Fecha de ingreso', 'estado': 'Estado', 'nombre_paciente': 'Nombre paciente', 'doctor': 'Doctor', 'tons_a_cargo': 'Tons a cargo', 'fecha_diseno': 'F. Diseño', 'fecha_fresado': 'F. Fresado', 'fecha_entrega': 'F. Entrega', 'sucursal': 'Sucursal', 'asunto_detalles': 'Detalles', 'material': 'Material', 'diseno': 'Diseño', 'bloques_usados': 'Bloques'}
        return df.rename(columns=renombre)
    except: return pd.DataFrame()

# --- 5. SIDEBAR ---
with st.sidebar:
    if os.path.exists("logo.png"):
        st.image("logo.png", use_container_width=True)
    else:
        st.title("🦷 Lab Tabancura")
    st.markdown("### 🛠️ Navegación")
    st.caption("Gestión interna de Policlínico Tabancura.")
    st.divider()
    st.info("💡 **Consejo:** Mantenga el cursor sobre los campos del formulario para ver ayuda adicional.")
    st.write(f"📅 **Hoy:** {date.today().strftime('%d/%m/%Y')}")

st.title("🦷 Registro Digital de Laboratorio")
st.markdown("---")

if engine is None:
    st.error("🔴 Error: No se pudo conectar a la base de datos.")
    st.stop()

tabs = st.tabs(["➕ Ingreso", "🔍 Visualizador", "✏️ Edición", "📈 Dashboard", "🗓️ Entregas", "📥 Exportar"])

# --- TAB 1: INGRESO (CON TOOLTIPS) ---
with tabs[0]:
    st.header("➕ Registrar Nuevo Trabajo")
    st.caption("Ingrese la información técnica para iniciar un nuevo caso clínico.")
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT MAX(identificador) FROM registros")).scalar()
            siguiente_id = int(res) + 1 if res and res >= 137 else 138
    except: siguiente_id = 138

    with st.form("form_ingreso", clear_on_submit=True):
        c1, c2, c3 = st.columns(3)
        in_id = c1.number_input("N° Identificador", min_value=1, value=siguiente_id, help="ID correlativo único del caso (Autogenerado).")
        in_f_ing = c2.date_input("Fecha de ingreso", value=date.today(), help="Fecha en que se recibe el requerimiento.")
        in_est = c3.selectbox("Estado inicial", [""] + OPCIONES_ESTADO, help="Estado actual del flujo de producción.")
        
        c4, c5, c6 = st.columns(3)
        in_pac = c4.text_input("Nombre paciente", help="Nombre completo para identificación en fichas.")
        in_doc = c5.selectbox("Doctor", [""] + OPCIONES_DOCTOR, help="Doctor que solicita el trabajo.")
        in_tons = c6.selectbox("Tons a cargo", [""] + OPCIONES_TONS, help="Técnico u Odontólogo responsable del proceso.")
        
        c7, c8, c9 = st.columns(3)
        in_suc = c7.selectbox("Sucursal", [""] + OPCIONES_SUCURSAL, help="Sucursal donde se realizará la entrega.")
        in_mat = c8.selectbox("Material", [""] + OPCIONES_MATERIAL, help="Tipo de material para la pieza dental.")
        in_blo = c9.selectbox("Bloques", [""] + OPCIONES_BLOQUES, help="Cantidad de bloques requeridos para el fresado.")
        
        in_dis = st.selectbox("Modalidad de Diseño", [""] + OPCIONES_DISENO, help="Método o responsable del diseño digital.")
        in_det = st.text_area("Instrucciones / Observaciones", help="Detalles técnicos adicionales, tonos específicos o requerimientos especiales.")
        
        if st.form_submit_button("💾 GUARDAR REGISTRO", use_container_width=True):
            if not in_pac or not in_est:
                st.warning("⚠️ El Nombre del Paciente y el Estado son obligatorios para el registro.")
            else:
                with engine.begin() as conn:
                    query = text("""INSERT INTO registros (identificador, fecha_ingreso, estado, nombre_paciente, doctor, tons_a_cargo, sucursal, material, diseno, asunto_detalles, bloques_usados) 
                                    VALUES (:id, :fi, :es, :pa, :do, :to, :su, :ma, :di, :de, :bl)""")
                    conn.execute(query, {"id":in_id, "fi":str(in_f_ing), "es":in_est, "pa":in_pac, "do":in_doc, "to":in_tons, "su":in_suc, "ma":in_mat, "di":in_dis, "de":in_det, "bl":in_blo})
                st.success("✅ Caso guardado. Puede verlo ahora en el Visualizador.")
                st.rerun()

# --- TAB 2: VISUALIZADOR ---
with tabs[1]:
    st.header("🔍 Explorador de Casos")
    st.caption("Consulte el historial completo. La tabla permite búsqueda por cualquier término.")
    st.info("💡 **Consejo:** Haga clic en el encabezado de una columna para ordenar de forma ascendente o descendente.")
    busq = st.text_input("🔍 Buscar:", placeholder="Escriba nombre, ID, material...")
    df_v = cargar_datos()
    if not df_v.empty:
        if busq:
            mask = df_v.astype(str).apply(lambda x: x.str.contains(busq, case=False, na=False)).any(axis=1)
            df_v = df_v[mask]
        st.dataframe(df_v.style.map(aplicar_colores, subset=['Estado']), use_container_width=True, height=500)

# --- TAB 3: EDICIÓN (CON TOOLTIPS) ---
with tabs[2]:
    st.header("✏️ Modificar Trabajo")
    st.caption("Actualice parámetros de un caso ya registrado.")
    df_e_raw = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
    if not df_e_raw.empty:
        sel_e = st.selectbox("Seleccione caso:", ["..."] + [f"{r['identificador']} - {r['nombre_paciente']}" for _, r in df_e_raw.iterrows()], help="Busque el caso por ID o nombre del paciente.")
        if sel_e != "...":
            id_ed = int(sel_e.split(" - ")[0]); d = df_e_raw[df_e_raw['identificador'] == id_ed].iloc[0]
            with st.form("form_ed_completo"):
                c1, c2, c3 = st.columns(3); ed_pac = c1.text_input("Paciente", value=str(d['nombre_paciente']), help="Corregir nombre si es necesario."); ed_est = c2.selectbox("Estado", OPCIONES_ESTADO, index=OPCIONES_ESTADO.index(d['estado']) if d['estado'] in OPCIONES_ESTADO else 0, help="Actualizar avance de producción."); ed_doc = c3.selectbox("Doctor", OPCIONES_DOCTOR, index=OPCIONES_DOCTOR.index(d['doctor']) if d['doctor'] in OPCIONES_DOCTOR else 0)
                c4, c5, c6 = st.columns(3); ed_tons = c4.selectbox("Tons", OPCIONES_TONS, index=OPCIONES_TONS.index(d['tons_a_cargo']) if d['tons_a_cargo'] in OPCIONES_TONS else 0); ed_suc = c5.selectbox("Sucursal", OPCIONES_SUCURSAL, index=OPCIONES_SUCURSAL.index(d['sucursal']) if d['sucursal'] in OPCIONES_SUCURSAL else 0); ed_mat = c6.selectbox("Material", OPCIONES_MATERIAL, index=OPCIONES_MATERIAL.index(d['material']) if d['material'] in OPCIONES_MATERIAL else 0)
                c7, c8, c9 = st.columns(3)
                def to_dt(val): return pd.to_datetime(val).date() if val and str(val) != "None" else None
                ed_f_dis = c7.date_input("Fecha Diseño", value=to_dt(d['fecha_diseno']), help="Registrar cuando el diseño esté listo."); ed_f_fre = c8.date_input("Fecha Fresado", value=to_dt(d['fecha_fresado']), help="Registrar cuando se complete el fresado."); ed_f_ent = c9.date_input("Fecha Entrega", value=to_dt(d['fecha_entrega']), help="Fecha real o programada de entrega final.")
                c10, c11 = st.columns(2); ed_dis = c10.selectbox("Modalidad Diseño", OPCIONES_DISENO, index=OPCIONES_DISENO.index(d['diseno']) if d['diseno'] in OPCIONES_DISENO else 0); ed_blo = c11.selectbox("Bloques", OPCIONES_BLOQUES, index=OPCIONES_BLOQUES.index(d['bloques_usados']) if d['bloques_usados'] in OPCIONES_BLOQUES else 0)
                ed_det = st.text_area("Observaciones", value=str(d['asunto_detalles'] or ""))
                if st.form_submit_button("🔄 ACTUALIZAR REGISTRO COMPLETO", use_container_width=True):
                    with engine.begin() as conn:
                        query = text("UPDATE registros SET nombre_paciente=:pa, estado=:es, doctor=:doc, tons_a_cargo=:to, sucursal=:su, material=:ma, fecha_diseno=:fd, fecha_fresado=:ff, fecha_entrega=:fe, diseno=:di, bloques_usados=:bl, asunto_detalles=:de WHERE identificador=:id")
                        conn.execute(query, {"pa":ed_pac, "es":ed_est, "doc":ed_doc, "to":ed_tons, "su":ed_suc, "ma":ed_mat, "fd":str(ed_f_dis), "ff":str(ed_f_fre), "fe":str(ed_f_ent), "di":ed_dis, "bl":ed_blo, "de":ed_det, "id":id_ed})
                    st.success("✅ Cambios aplicados correctamente."); st.rerun()

# --- TAB 4: DASHBOARD ( KPI + REPORTES) ---
with tabs[3]:
    st.header("📈 Dashboard de Gestión")
    st.caption("Visualización de indicadores clave y carga operativa del laboratorio.")
    df_db = cargar_datos()
    if not df_db.empty:
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Total Casos", len(df_db), help="Cantidad histórica total de trabajos registrados.")
        k2.metric("Tons más ocupado", df_db['Tons a cargo'].mode()[0] if not df_db['Tons a cargo'].mode().empty else "-", help="Técnico con mayor cantidad de trabajos asignados.")
        k3.metric("Material más usado", df_db['Material'].mode()[0] if not df_db['Material'].mode().empty else "-", help="Material con mayor demanda.")
        k4.metric("Día con más ingresos", str(df_db['Fecha de ingreso'].mode()[0]) if not df_db['Fecha de ingreso'].empty else "-", help="Fecha histórica con mayor volumen de entrada.")
        st.divider()
        g1, g2 = st.columns(2); g1.plotly_chart(px.bar(df_db['Estado'].value_counts().reset_index(), x='Estado', y='count', color='Estado', title="Trabajos por Estado"), use_container_width=True); g2.plotly_chart(px.pie(df_db, names='Material', title="Uso de Materiales", hole=0.4), use_container_width=True)
        g3, g4 = st.columns(2); g3.plotly_chart(px.bar(df_db['Tons a cargo'].value_counts().reset_index(), x='Tons a cargo', y='count', title="Carga por Técnico", color_discrete_sequence=['#007bff']), use_container_width=True)
        df_line = df_db.groupby('Fecha de ingreso').size().reset_index(name='Cant'); g4.plotly_chart(px.line(df_line, x='Fecha de ingreso', y='Cant', title="Tendencia de Ingresos", markers=True), use_container_width=True)

# --- TAB 5: ENTREGAS ---
with tabs[4]:
    st.header("🗓️ Próximas Entregas")
    st.caption("Agenda de entregas prioritarias. Se excluyen los trabajos ya entregados.")
    st.warning("⚠️ Asegúrese de actualizar el estado a 'Entregado' en la pestaña de Edición una vez despachado el trabajo.")
    df_p = cargar_datos()
    if not df_p.empty:
        df_p['f_dt'] = pd.to_datetime(df_p['F. Entrega'], errors='coerce')
        pend = df_p[df_p['Estado'] != 'Entregado'].sort_values('f_dt')
        st.dataframe(pend[['N° ID', 'Nombre paciente', 'F. Entrega', 'Estado', 'Tons a cargo', 'Sucursal']], use_container_width=True)

# --- TAB 6: EXPORTACIÓN (FILTROS + BOTONES) ---
with tabs[5]:
    st.header("📥 Exportar Datos")
    st.caption("Genere archivos descargables para respaldos o reportes externos.")
    df_ex = cargar_datos()
    if not df_ex.empty:
        with st.expander("🔍 Filtrar reporte por:", expanded=True):
            f_col1, f_col2 = st.columns(2)
            ex_suc = f_col1.multiselect("Sucursal:", OPCIONES_SUCURSAL, default=OPCIONES_SUCURSAL, help="Seleccione las sucursales a incluir.")
            ex_est = f_col2.multiselect("Estado:", OPCIONES_ESTADO, default=OPCIONES_ESTADO, help="Seleccione los estados a incluir.")
            df_final = df_ex[(df_ex['Sucursal'].isin(ex_suc)) & (df_ex['Estado'].isin(ex_est))]
        st.write(f"📊 **Registros listos para descarga:** {len(df_final)}")
        c_d1, c_d2 = st.columns(2)
        c_d1.download_button("📥 Descargar CSV", df_final.to_csv(index=False).encode('utf-8-sig'), "reporte_lab_digital.csv", "text/csv", use_container_width=True, help="Archivo compatible con cualquier editor de texto o base de datos.")
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as wr: df_final.to_excel(wr, index=False, sheet_name='Reporte')
        c_d2.download_button("📊 Descargar Excel", output.getvalue(), "reporte_lab_digital.xlsx", use_container_width=True, help="Archivo optimizado para Microsoft Excel con formato de celdas.")