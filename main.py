import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, text
from datetime import date
import plotly.express as px
import io

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Lab Digital Pro - Tabancura", layout="wide", page_icon="🦷")

# --- 1. DEFINICIÓN DE OPCIONES ---
OPCIONES_ESTADO = ["Solicitado", "En progreso", "Aceptado", "Entregado", "Fresado", "Diseñado", "Listo"]
OPCIONES_DOCTOR = ["Grace Martinson", "Pauline Heinriksen", "Francisca Corbalán", "David Sandoval", "Antonio Alvear", "José Acuña", "Sebastián Ortíz", "Antonia Pardo"]
OPCIONES_TONS = ["Sasha U.", "Martina T.", "Valentina S.", "Javiera P.", "Álvaro M.", "Millaray", "Isidora Q.", "Carolina H.", "Carolina S.", "SIN TONS", "Antonio Alvear", "Natalia A.", "TONS Tribunales", "Dr(a)"]
OPCIONES_SUCURSAL = ["Sucursal Los Tribunales", "Sucursal Vitacura"]
OPCIONES_MATERIAL = ["Disilicato A3", "Hibrido A3", "Híbrido A2", "Disilicato A2", "Disilicato A1", "Disilicato", "Híbrido A1", "PMMA"]
OPCIONES_DISENO = ["Modalidad Chairside", "Diseñado por David", "Diseñado por Pauline", "Diseñado por Antonio", "Diseñado por Grace", "Diseñado por Sebastian"]
# Nuevas opciones para bloques
OPCIONES_BLOQUES = ["1 bloque", "2 bloques", "3 bloques", "4 bloques", "5 o más bloques"]

# --- 2. CONEXIÓN A BASE DE DATOS ---
def get_engine():
    pg = st.secrets["postgres"]
    url = f"postgresql://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
    return create_engine(url)

engine = get_engine()

# --- 3. FUNCIONES DE APOYO ---
def aplicar_colores(val):
    colores = {
        'Solicitado': 'background-color: #ffcccc; color: #990000; font-weight: bold;',
        'En progreso': 'background-color: #fff4cc; color: #996600; font-weight: bold;',
        'Aceptado': 'background-color: #e2f0d9; color: #385723; font-weight: bold;',
        'Entregado': 'background-color: #d9e2f3; color: #1f4e78; font-weight: bold;',
        'Fresado': 'background-color: #e1d5e7; color: #53315a; font-weight: bold;',
        'Diseñado': 'background-color: #dae8fc; color: #004085; font-weight: bold;',
        'Listo': 'background-color: #d4edda; color: #155724; font-weight: bold;'
    }
    return colores.get(val, '')

def safe_date(date_str):
    if not date_str or str(date_str) in ["None", "nan", "NaT"]: return None
    try: return pd.to_datetime(date_str).date()
    except: return None

def cargar_datos_formateados():
    df = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
    renombre = {
        'identificador': 'N° Identificador', 'fecha_ingreso': 'Fecha de ingreso',
        'estado': 'Estado', 'nombre_paciente': 'Nombre paciente',
        'doctor': 'Doctor', 'tons_a_cargo': 'Tons a cargo',
        'fecha_diseno': 'Fecha de diseño', 'fecha_fresado': 'Fecha de fresado',
        'fecha_entrega': 'Fecha de entrega', 'sucursal': 'Sucursal',
        'asunto_detalles': 'Asunto / Detalles', 'material': 'Material',
        'diseno': 'Diseño', 'bloques_usados': 'Bloques usados'
    }
    df = df.rename(columns=renombre)
    orden = ['N° Identificador', 'Fecha de ingreso', 'Estado', 'Nombre paciente', 'Doctor', 'Tons a cargo', 
             'Fecha de diseño', 'Fecha de fresado', 'Fecha de entrega', 'Sucursal', 'Asunto / Detalles', 
             'Material', 'Diseño', 'Bloques usados']
    return df[[c for c in orden if c in df.columns]]

# --- 4. SIDEBAR ---
with st.sidebar:
    try: st.image("logo.png", use_container_width=True)
    except: st.warning("Logo no encontrado")
    st.title("Panel Lab Digital")
    st.write("Policlínico Tabancura")
    st.divider()

# --- 5. INTERFAZ ---
tabs = st.tabs(["➕ Ingreso", "📊 Visualizador", "✏️ Edición", "📈 Dashboard Pro", "🗓️ Entregas", "📥 Exportar"])

# --- PESTAÑA 1: INGRESO ---
with tabs[0]:
    st.subheader("Registrar Nuevo Trabajo")
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT MAX(identificador) FROM registros")).scalar()
            siguiente_id = int(res) + 1 if res and res >= 137 else 138
    except: siguiente_id = 138

    with st.form("form_ingreso", clear_on_submit=True):
        c1, c2, c3 = st.columns(3)
        in_id = c1.number_input("N° Identificador", min_value=1, value=siguiente_id)
        in_f_ing = c2.date_input("Fecha de ingreso", value=date.today())
        in_est = c3.selectbox("Estado", options=[""] + OPCIONES_ESTADO)
        
        c4, c5, c6 = st.columns(3)
        in_pac = c4.text_input("Nombre paciente")
        in_doc = c5.selectbox("Doctor", options=[""] + OPCIONES_DOCTOR)
        in_tons = c6.selectbox("Tons a cargo", options=[""] + OPCIONES_TONS)
        
        c7, c8, c9 = st.columns(3)
        in_f_dis = c7.date_input("Fecha de diseño", value=None)
        in_f_fre = c8.date_input("Fecha de fresado", value=None)
        in_f_ent = c9.date_input("Fecha de entrega", value=None)
        
        c10, c11, c12 = st.columns(3)
        in_suc = c10.selectbox("Sucursal", options=[""] + OPCIONES_SUCURSAL)
        in_mat = c11.selectbox("Material", options=[""] + OPCIONES_MATERIAL)
        # Cambio a selectbox para bloques usados
        in_blo = c12.selectbox("Bloques usados", options=[""] + OPCIONES_BLOQUES)
        
        in_dis = st.selectbox("Diseño", options=[""] + OPCIONES_DISENO)
        in_det = st.text_area("Asunto / Detalles")
        
        if st.form_submit_button("Guardar Registro"):
            with engine.begin() as conn:
                query = text("""INSERT INTO registros (identificador, fecha_ingreso, estado, nombre_paciente, doctor, tons_a_cargo, fecha_diseno, fecha_fresado, fecha_entrega, sucursal, material, diseno, asunto_detalles, bloques_usados) 
                                VALUES (:id, :fi, :es, :pa, :do, :to, :fd, :ff, :fe, :su, :ma, :di, :de, :bl)""")
                conn.execute(query, {"id":in_id, "fi":str(in_f_ing), "es":in_est, "pa":in_pac, "do":in_doc, "to":in_tons, "fd":str(in_f_dis), "ff":str(in_f_fre), "fe":str(in_f_ent), "su":in_suc, "ma":in_mat, "di":in_dis, "de":in_det, "bl":in_blo})
            st.success("Guardado!"); st.rerun()

# --- PESTAÑA 2: VISUALIZADOR ---
with tabs[1]:
    st.subheader("Buscador Multicolumna")
    busq = st.text_input("🔍 Filtro inteligente:")
    df_v = cargar_datos_formateados()
    if not df_v.empty:
        if busq:
            mask = df_v.astype(str).apply(lambda x: x.str.contains(busq, case=False, na=False)).any(axis=1)
            df_v = df_v[mask]
        st.dataframe(df_v.style.map(aplicar_colores, subset=['Estado']), use_container_width=True, height=500)

# --- PESTAÑA 3: EDICIÓN COMPLETA ---
with tabs[2]:
    st.subheader("Edición de Registro")
    df_e_raw = pd.read_sql("SELECT * FROM registros ORDER BY identificador DESC", engine)
    if not df_e_raw.empty:
        lista_edit = [f"{r['identificador']} - {r['nombre_paciente']}" for _, r in df_e_raw.iterrows()]
        sel_e = st.selectbox("Seleccione para editar:", ["Seleccione..."] + lista_edit)
        
        if sel_e != "Seleccione...":
            id_ed = int(sel_e.split(" - ")[0])
            d = df_e_raw[df_e_raw['identificador'] == id_ed].iloc[0]
            
            with st.form("form_ed_total"):
                c1, c2, c3 = st.columns(3)
                ed_fi = c1.date_input("Fecha Ingreso", safe_date(d['fecha_ingreso']))
                ed_es_idx = OPCIONES_ESTADO.index(d['estado']) + 1 if d['estado'] in OPCIONES_ESTADO else 0
                ed_es = c2.selectbox("Estado", [""] + OPCIONES_ESTADO, index=ed_es_idx)
                ed_pa = c3.text_input("Nombre Paciente", value=str(d['nombre_paciente'] or ""))
                
                c4, c5, c6 = st.columns(3)
                ed_do_idx = OPCIONES_DOCTOR.index(d['doctor']) + 1 if d['doctor'] in OPCIONES_DOCTOR else 0
                ed_do = c4.selectbox("Doctor", [""] + OPCIONES_DOCTOR, index=ed_do_idx)
                ed_to_idx = OPCIONES_TONS.index(d['tons_a_cargo']) + 1 if d['tons_a_cargo'] in OPCIONES_TONS else 0
                ed_to = c5.selectbox("Tons a cargo", [""] + OPCIONES_TONS, index=ed_to_idx)
                ed_su_idx = OPCIONES_SUCURSAL.index(d['sucursal']) + 1 if d['sucursal'] in OPCIONES_SUCURSAL else 0
                ed_su = c6.selectbox("Sucursal", [""] + OPCIONES_SUCURSAL, index=ed_su_idx)
                
                c7, c8, c9 = st.columns(3)
                ed_fd = c7.date_input("Fecha Diseño", safe_date(d['fecha_diseno']))
                ed_ff = c8.date_input("Fecha Fresado", safe_date(d['fecha_fresado']))
                ed_fe = c9.date_input("Fecha Entrega", safe_date(d['fecha_entrega']))
                
                c10, c11, c12 = st.columns(3)
                ed_ma_idx = OPCIONES_MATERIAL.index(d['material']) + 1 if d['material'] in OPCIONES_MATERIAL else 0
                ed_ma = c10.selectbox("Material", [""] + OPCIONES_MATERIAL, index=ed_ma_idx)
                ed_di_idx = OPCIONES_DISENO.index(d['diseno']) + 1 if d['diseno'] in OPCIONES_DISENO else 0
                ed_di = c11.selectbox("Diseño", [""] + OPCIONES_DISENO, index=ed_di_idx)
                # Cambio a selectbox para bloques usados en edición
                ed_blo_val = d['bloques_usados'] if d['bloques_usados'] in OPCIONES_BLOQUES else ""
                ed_blo = c12.selectbox("Bloques Usados", [""] + OPCIONES_BLOQUES, index=(OPCIONES_BLOQUES.index(ed_blo_val)+1 if ed_blo_val else 0))
                
                ed_det = st.text_area("Asunto / Detalles", value=str(d['asunto_detalles'] or ""))
                
                if st.form_submit_button("Actualizar Registro"):
                    with engine.begin() as conn:
                        conn.execute(text("""UPDATE registros SET fecha_ingreso=:fi, estado=:es, nombre_paciente=:pa, doctor=:doc, tons_a_cargo=:to, sucursal=:su, fecha_diseno=:fd, fecha_fresado=:ff, fecha_entrega=:fe, material=:ma, diseno=:di, asunto_detalles=:de, bloques_usados=:bl WHERE identificador=:id"""),
                        {"fi":str(ed_fi), "es":ed_es, "pa":ed_pa, "doc":ed_do, "to":ed_to, "su":ed_su, "fd":str(ed_fd), "ff":str(ed_ff), "fe":str(ed_fe), "ma":ed_ma, "di":ed_di, "de":ed_de, "bl":ed_blo, "id":id_ed})
                    st.success("¡Actualizado!"); st.rerun()

            if st.button("🗑️ Eliminar Trabajo"):
                with engine.begin() as conn: conn.execute(text("DELETE FROM registros WHERE identificador=:id"), {"id":id_ed})
                st.warning("Eliminado"); st.rerun()

# --- PESTAÑA 4: DASHBOARD PRO ---
with tabs[3]:
    st.subheader("📈 Análisis de Datos del Laboratorio")
    df_db = cargar_datos_formateados()
    
    if not df_db.empty:
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Total Trabajos", len(df_db))
        k2.metric("Tons con mayor registro", df_db['Tons a cargo'].mode()[0] if not df_db['Tons a cargo'].mode().empty else "N/A")
        k3.metric("Material más utilizado", df_db['Material'].mode()[0] if not df_db['Material'].mode().empty else "N/A")
        k4.metric("Día con mayor ingresos", df_db['Fecha de ingreso'].mode()[0] if not df_db['Fecha de ingreso'].mode().empty else "N/A")
        
        st.divider()
        g1, g2 = st.columns(2)
        fig_est = px.bar(df_db['Estado'].value_counts().reset_index(), x='Estado', y='count', color='Estado', title="Trabajos por Estado")
        g1.plotly_chart(fig_est, use_container_width=True)
        fig_mat = px.pie(df_db, names='Material', title="Uso de Materiales", hole=0.3)
        g2.plotly_chart(fig_mat, use_container_width=True)
        
        st.divider()
        c_left, c_right = st.columns(2)
        fig_tons = px.bar(df_db['Tons a cargo'].value_counts().reset_index(), x='Tons a cargo', y='count', title="Productividad por Tons", color_discrete_sequence=['#3498db'])
        c_left.plotly_chart(fig_tons, use_container_width=True)
        fig_line = px.line(df_db.groupby('Fecha de ingreso').size().reset_index(name='Cant'), x='Fecha de ingreso', y='Cant', title="Tendencia de Ingresos", markers=True)
        c_right.plotly_chart(fig_line, use_container_width=True)

# --- PESTAÑA 5: ENTREGAS ---
with tabs[4]:
    st.subheader("🗓️ Próximas Entregas")
    df_p = cargar_datos_formateados()
    if not df_p.empty:
        df_p['f_dt_obj'] = pd.to_datetime(df_p['Fecha de entrega'], errors='coerce')
        pend = df_p[df_p['Estado'] != 'Entregado'].sort_values('f_dt_obj')
        st.dataframe(pend[['N° Identificador', 'Nombre paciente', 'Fecha de entrega', 'Estado', 'Tons a cargo', 'Sucursal']], use_container_width=True)

# --- PESTAÑA 6: EXPORTACIÓN ---
with tabs[5]:
    st.subheader("📥 Centro de Exportación")
    df_ex = cargar_datos_formateados()
    
    with st.expander("Filtros para el reporte", expanded=True):
        f_col1, f_col2 = st.columns(2)
        ex_suc = f_col1.multiselect("Sucursal", OPCIONES_SUCURSAL, default=OPCIONES_SUCURSAL)
        ex_est = f_col2.multiselect("Estado", OPCIONES_ESTADO, default=OPCIONES_ESTADO)
        df_final = df_ex[(df_ex['Sucursal'].isin(ex_suc)) & (df_ex['Estado'].isin(ex_est))]
    
    st.write(f"Datos filtrados ({len(df_final)} registros):")
    st.dataframe(df_final, use_container_width=True)
    
    c_d1, c_d2 = st.columns(2)
    c_d1.download_button("Descargar CSV", df_final.to_csv(index=False).encode('utf-8-sig'), "reporte_lab.csv", "text/csv")
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as wr:
        df_final.to_excel(wr, index=False, sheet_name='Registros')
    c_d2.download_button("Descargar Excel", output.getvalue(), "reporte_lab.xlsx")