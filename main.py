import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import date
import plotly.express as px
import io
import os

# --- 1. CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Laboratorio Digital Tabancura", layout="wide", page_icon="🦷")

# CSS Normalizado: Eliminamos fondos fijos para que Streamlit use su motor de temas
st.markdown("""
    <style>
    /* Estilo para métricas que se adapta al fondo */
    [data-testid="stMetric"] {
        border: 1px solid rgba(128, 128, 128, 0.2);
        padding: 15px;
        border-radius: 10px;
    }
    /* Estilo para formularios sin forzar color de fondo */
    [data-testid="stForm"] {
        border: 1px solid rgba(128, 128, 128, 0.3);
        padding: 25px;
        border-radius: 12px;
    }
    /* Mejora legibilidad de captions */
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
    # Colores con opacidad (RGBA) para que funcionen sobre fondos claros y oscuros
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
    return f'{style} font-weight: bold; border: 1px solid rgba(255,255,255,0.1);' if style else ''

def cargar_datos():
    if engine is None: return pd.DataFrame()
    try:
        df = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
        renombre = {'identificador': 'N° ID', 'fecha_ingreso': 'Fecha de ingreso', 'estado': 'Estado', 'nombre_paciente': 'Nombre paciente', 'doctor': 'Doctor', 'tons_a_cargo': 'Tons a cargo', 'fecha_diseno': 'F. Diseño', 'fecha_fresado': 'F. Fresado', 'fecha_entrega': 'F. Entrega', 'sucursal': 'Sucursal', 'asunto_detalles': 'Detalles', 'material': 'Material', 'diseno': 'Diseño', 'bloques_usados': 'Bloques'}
        return df.rename(columns=renombre)
    except: return pd.DataFrame()

# --- 5. SIDEBAR ---
with st.sidebar:
    try: st.image("logo.png", use_container_width=True)
    except: st.title("🦷 Lab Tabancura")
    st.markdown("### 🛠️ Navegación")
    st.caption("Utilice las pestañas superiores para gestionar el flujo de trabajo.")
    st.divider()
    st.write(f"📅 **Hoy:** {date.today().strftime('%d/%m/%Y')}")

st.title("🦷 Registro Digital de Laboratorio")
st.markdown("---")

if engine is None:
    st.error("🔴 **Error de Conexión:** No se pudo conectar con la base de datos.")
    st.stop()

tabs = st.tabs(["➕ Ingreso", "🔍 Visualizador", "✏️ Edición", "📈 Dashboard", "🗓️ Entregas", "📥 Exportar"])

# --- TAB 1: INGRESO ---
with tabs[0]:
    st.header("➕ Registrar Nuevo Trabajo")
    st.caption("Complete la información para dar de alta un nuevo caso clínico.")
    
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT MAX(identificador) FROM registros")).scalar()
            siguiente_id = int(res) + 1 if res and res >= 137 else 138
    except: siguiente_id = 138

    with st.form("form_ingreso", clear_on_submit=True):
        c1, c2, c3 = st.columns([1, 1, 1])
        in_id = c1.number_input("N° Identificador", min_value=1, value=siguiente_id)
        in_f_ing = c2.date_input("Fecha de ingreso", value=date.today())
        in_est = c3.selectbox("Estado inicial", [""] + OPCIONES_ESTADO)
        
        c4, c5, c6 = st.columns(3)
        in_pac = c4.text_input("Nombre paciente")
        in_doc = c5.selectbox("Doctor", [""] + OPCIONES_DOCTOR)
        in_tons = c6.selectbox("Tons a cargo", [""] + OPCIONES_TONS)
        
        c7, c8, c9 = st.columns(3)
        in_suc = c7.selectbox("Sucursal", [""] + OPCIONES_SUCURSAL)
        in_mat = c8.selectbox("Material", [""] + OPCIONES_MATERIAL)
        in_blo = c9.selectbox("Bloques", [""] + OPCIONES_BLOQUES)
        
        in_dis = st.selectbox("Modalidad de Diseño", [""] + OPCIONES_DISENO)
        in_det = st.text_area("Instrucciones / Observaciones")
        
        if st.form_submit_button("💾 GUARDAR REGISTRO", use_container_width=True):
            if not in_pac or not in_est:
                st.warning("⚠️ Nombre y Estado son obligatorios.")
            else:
                with engine.begin() as conn:
                    query = text("""INSERT INTO registros (identificador, fecha_ingreso, estado, nombre_paciente, doctor, tons_a_cargo, sucursal, material, diseno, asunto_detalles, bloques_usados) 
                                    VALUES (:id, :fi, :es, :pa, :do, :to, :su, :ma, :di, :de, :bl)""")
                    conn.execute(query, {"id":in_id, "fi":str(in_f_ing), "es":in_est, "pa":in_pac, "do":in_doc, "to":in_tons, "su":in_suc, "ma":in_mat, "di":in_dis, "de":in_det, "bl":in_blo})
                st.success(f"✅ Caso #{in_id} guardado.")
                st.rerun()

# --- TAB 2: VISUALIZADOR ---
with tabs[1]:
    st.header("🔍 Explorador de Casos")
    st.caption("Consulte y filtre el listado histórico de trabajos registrados.")
    busq = st.text_input("🔍 Filtrar por nombre, ID o doctor:", placeholder="Escriba aquí...")
    df_v = cargar_datos()
    if not df_v.empty:
        if busq:
            mask = df_v.astype(str).apply(lambda x: x.str.contains(busq, case=False, na=False)).any(axis=1)
            df_v = df_v[mask]
        st.dataframe(df_v.style.map(aplicar_colores, subset=['Estado']), use_container_width=True, height=500)

# --- TAB 3: EDICIÓN ---
with tabs[2]:
    st.header("✏️ Modificar Trabajo")
    st.caption("Actualice estados, fechas o detalles de un registro existente.")
    df_e_raw = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
    if not df_e_raw.empty:
        sel_e = st.selectbox("Seleccione caso para editar:", ["..."] + [f"{r['identificador']} - {r['nombre_paciente']}" for _, r in df_e_raw.iterrows()])
        if sel_e != "...":
            id_ed = int(sel_e.split(" - ")[0])
            d = df_e_raw[df_e_raw['identificador'] == id_ed].iloc[0]
            with st.form("form_ed"):
                c1, c2 = st.columns(2)
                ed_pa = c1.text_input("Nombre Paciente", value=d['nombre_paciente'])
                ed_es = c2.selectbox("Estado", OPCIONES_ESTADO, index=OPCIONES_ESTADO.index(d['estado']) if d['estado'] in OPCIONES_ESTADO else 0)
                ed_det = st.text_area("Detalles", value=str(d['asunto_detalles'] or ""))
                if st.form_submit_button("🔄 ACTUALIZAR REGISTRO", use_container_width=True):
                    with engine.begin() as conn:
                        conn.execute(text("UPDATE registros SET estado=:es, nombre_paciente=:pa, asunto_detalles=:de WHERE identificador=:id"), {"es":ed_es, "pa":ed_pa, "de":ed_det, "id":id_ed})
                    st.success("Registro actualizado.")
                    st.rerun()

# --- TAB 4: DASHBOARD ---
with tabs[3]:
    st.header("📈 Dashboard de Gestión")
    st.caption("Estadísticas clave sobre la producción y uso de materiales.")
    df_db = cargar_datos()
    if not df_db.empty:
        k1, k2, k3 = st.columns(3)
        k1.metric("Total Casos", len(df_db))
        k2.metric("Material más usado", df_db['Material'].mode()[0] if not df_db['Material'].empty else "-")
        k3.metric("Sucursal Activa", df_db['Sucursal'].mode()[0] if not df_db['Sucursal'].empty else "-")
        st.divider()
        g1, g2 = st.columns(2)
        g1.plotly_chart(px.bar(df_db['Estado'].value_counts().reset_index(), x='Estado', y='count', title="Distribución por Estado", template="plotly_dark" if st.get_option("theme.base") == "dark" else "plotly"), use_container_width=True)
        g2.plotly_chart(px.pie(df_db, names='Material', title="Uso de Materiales", hole=0.3), use_container_width=True)

# --- TAB 5: ENTREGAS ---
with tabs[4]:
    st.header("🗓️ Próximas Entregas")
    st.caption("Listado de trabajos pendientes ordenados por prioridad de entrega.")
    df_p = cargar_datos()
    if not df_p.empty:
        df_p['f_dt'] = pd.to_datetime(df_p['F. Entrega'], errors='coerce')
        pend = df_p[df_p['Estado'] != 'Entregado'].sort_values('f_dt')
        st.dataframe(pend[['N° ID', 'Nombre paciente', 'F. Entrega', 'Estado', 'Sucursal']], use_container_width=True)

# --- TAB 6: EXPORTAR ---
with tabs[5]:
    st.header("📥 Exportar Datos")
    st.caption("Descargue reportes en formato Excel o CSV aplicando filtros personalizados.")
    df_ex = cargar_datos()
    with st.container(border=True):
        f1, f2 = st.columns(2)
        ex_suc = f1.multiselect("Sucursal:", OPCIONES_SUCURSAL, default=OPCIONES_SUCURSAL)
        ex_est = f2.multiselect("Estado:", OPCIONES_ESTADO, default=OPCIONES_ESTADO)
        df_res = df_ex[(df_ex['Sucursal'].isin(ex_suc)) & (df_ex['Estado'].isin(ex_est))]
    
    st.write(f"📊 Registros listos: {len(df_res)}")
    c_d1, c_d2 = st.columns(2)
    c_d1.download_button("Descargar CSV", df_res.to_csv(index=False).encode('utf-8-sig'), "lab_tabancura.csv", use_container_width=True)
    out = io.BytesIO()
    with pd.ExcelWriter(out, engine='xlsxwriter') as wr: df_res.to_excel(wr, index=False)
    c_d2.download_button("Descargar Excel", out.getvalue(), "lab_tabancura.xlsx", use_container_width=True)