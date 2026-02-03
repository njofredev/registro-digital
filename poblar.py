import pandas as pd
from sqlalchemy import create_engine, text
import streamlit as st

# Configuración desde .streamlit/secrets.toml
# Asegúrate de ejecutar con 'streamlit run poblar.py' para que st.secrets funcione
try:
    pg = st.secrets["postgres"]
    DATABASE_URL = f"postgresql://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
except Exception as e:
    st.error("No se pudieron cargar los secretos de la base de datos.")
    DATABASE_URL = None

def poblar_sistema():
    if not DATABASE_URL:
        return

    try:
        engine = create_engine(DATABASE_URL)
        
        # 1. Leer el archivo con detección automática de separador (solución al error de tokenización)
        print("Leyendo archivo CSV...")
        df = pd.read_csv(
            'registro_lab.csv', 
            sep=None,           # Detecta automáticamente , o ;
            engine='python',    # Necesario para que sep=None funcione
            encoding='utf-8-sig'
        )

        # 2. Normalizar nombres de columnas
        # Validamos que el número de columnas sea el correcto para evitar errores de asignación
        if len(df.columns) == 14:
            df.columns = [
                'identificador', 'asunto_detalles', 'bloques_usados', 'diseno', 'doctor', 
                'estado', 'fecha_diseno', 'fecha_fresado', 'fecha_ingreso', 
                'fecha_entrega', 'material', 'nombre_paciente', 'sucursal', 'tons_a_cargo'
            ]
        else:
            raise ValueError(f"El CSV tiene {len(df.columns)} columnas, pero el código espera 14.")

        # 3. LIMPIEZA AGRESIVA
        # Eliminar filas completamente vacías
        df = df.dropna(how='all')
        
        # Asegurar que el identificador sea un número limpio
        df['identificador'] = pd.to_numeric(df['identificador'], errors='coerce')
        
        # Eliminar cualquier fila donde el identificador no sea un número (ej. filas de texto o basura)
        df = df.dropna(subset=['identificador'])
        
        # Convertir a entero
        df['identificador'] = df['identificador'].astype(int)

        # ELIMINAR DUPLICADOS: Evita errores de Primary Key en la BD
        antes = len(df)
        df = df.drop_duplicates(subset=['identificador'], keep='last')
        despues = len(df)
        
        if antes != despues:
            print(f"⚠️ Se eliminaron {antes - despues} duplicados detectados en el CSV.")

        # Convertir todo lo demás a texto y manejar NULLs correctamente para SQL
        df = df.where(pd.notnull(df), None)

        # 4. Inserción en la Base de Datos
        with engine.begin() as conn:
            print("Preparando tabla en PostgreSQL...")
            conn.execute(text("DROP TABLE IF EXISTS registros CASCADE;"))
            conn.execute(text("""
                CREATE TABLE registros (
                    identificador INTEGER PRIMARY KEY,
                    asunto_detalles TEXT,
                    bloques_usados TEXT,
                    diseno TEXT,
                    doctor TEXT,
                    estado TEXT,
                    fecha_diseno TEXT,
                    fecha_fresado TEXT,
                    fecha_ingreso TEXT,
                    fecha_entrega TEXT,
                    material TEXT,
                    nombre_paciente TEXT,
                    sucursal TEXT,
                    tons_a_cargo TEXT
                );
            """))
            
            print(f"Subiendo {len(df)} filas...")
            df.to_sql('registros', conn, if_exists='append', index=False)
            
        print("✅ ¡Poblado exitoso! La base de datos está lista.")
        st.success("¡Base de datos poblada con éxito!")

    except Exception as e:
        st.error(f"Error detectado: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    poblar_sistema()