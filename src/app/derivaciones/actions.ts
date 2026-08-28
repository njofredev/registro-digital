'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function createDerivacion(formData: FormData) {
  try {
    const identificador = await getNextDerivacionId();
    
    const fecha_ingreso = formData.get('fecha_ingreso') as string;
    const estado = formData.get('estado') as string;
    const nombre_paciente = formData.get('nombre_paciente') as string;
    // Solo Antonio Alvear según requerimiento del usuario
    const doctor = (formData.get('doctor') as string) || 'Antonio Alvear';
    const tons_a_cargo = formData.get('tons_a_cargo') as string;
    const fecha_diseno = formData.get('fecha_diseno') as string;
    const fecha_fresado = formData.get('fecha_fresado') as string;
    const fecha_entrega = formData.get('fecha_entrega') as string;
    const sucursal = formData.get('sucursal') as string;
    const material = formData.get('material') as string;
    const diseno = formData.get('diseno') as string;
    const bloques_usados = formData.get('bloques_usados') as string;
    const asunto_detalles = formData.get('asunto_detalles') as string;
    const piezas = formData.get('piezas') as string;

    await db.derivaciones.create({
      data: {
        identificador,
        fecha_ingreso,
        estado,
        nombre_paciente,
        doctor,
        tons_a_cargo,
        fecha_diseno,
        fecha_fresado,
        fecha_entrega,
        sucursal,
        material,
        diseno,
        bloques_usados,
        asunto_detalles,
        piezas,
      },
    });

    revalidatePath('/derivaciones');
    return { success: true, identificador };
  } catch (error: any) {
    console.error("Error in createDerivacion Server Action:", error);
    return { success: false, error: error.message || "Error al crear la derivación" };
  }
}

export async function updateDerivacion(identificador: number, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([k, v]) => v != null && (v !== '' || k === 'piezas' || k === 'asunto_detalles'))
    );

    await db.derivaciones.update({
      where: { identificador },
      data: cleanData,
    });

    revalidatePath('/derivaciones');
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateDerivacion Server Action:", error);
    return { success: false, error: error.message || "Error al actualizar la derivación" };
  }
}

export async function deleteDerivacion(identificador: number) {
  try {
    await db.derivaciones.delete({
      where: { identificador },
    });

    revalidatePath('/derivaciones');
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteDerivacion Server Action:", error);
    return { success: false, error: error.message || "Error al eliminar la derivación" };
  }
}

export async function getNextDerivacionId() {
  const max = await db.derivaciones.aggregate({
    _max: {
      identificador: true,
    },
  });
  return (max._max.identificador || 0) + 1;
}

export async function getDerivaciones() {
  return await db.derivaciones.findMany({
    orderBy: {
      identificador: 'desc',
    },
  });
}

const OPTIONS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'options.json');

export async function getDynamicOptions() {
  try {
    const fileContent = await fs.readFile(OPTIONS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return {
      ...parsed,
      doctor: ["Antonio Alvear"], // Para derivaciones el doctor fijo es Antonio Alvear
    };
  } catch (error) {
    console.error("Error reading dynamic options, using backup:", error);
    return {
      estado: ["Solicitado", "En progreso", "Aceptado", "Entregado", "Fresado", "Diseñado", "Listo"],
      doctor: ["Antonio Alvear"],
      tons_a_cargo: ["Sasha U.", "Natalia A.", "Martina T.", "Valentina S.", "Javiera P.", "Álvaro M.", "Isidora Q.", "Carolina H.", "Carolina S.", "SIN TONS", "Antonio Alvear", "TONS Tribunales", "Dr(a)"],
      sucursal: ["Sucursal Los Tribunales", "Sucursal Vitacura"],
      material: ["Disilicato A3", "Hibrido A3", "Híbrido A2", "Disilicato A2", "Disilicato A1", "Disilicato", "Híbrido A1", "PMMA"],
      diseno: ["Modalidad Chairside", "Diseñado por David", "Diseñado por Pauline", "Diseñado por Antonio", "Diseñado por Grace", "Diseñado por Sebastian"],
      bloques_usados: ["1 bloque", "2 bloques", "3 bloques", "4 bloques", "5 o más bloques"]
    };
  }
}
