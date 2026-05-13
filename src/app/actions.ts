'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function createRegistro(formData: FormData) {
  try {
    // Calculate the ID on the server right before creating to prevent collisions from stale client-side values
    const identificador = await getNextId();
    
    const fecha_ingreso = formData.get('fecha_ingreso') as string;
    const estado = formData.get('estado') as string;
    const nombre_paciente = formData.get('nombre_paciente') as string;
    const doctor = formData.get('doctor') as string;
    const tons_a_cargo = formData.get('tons_a_cargo') as string;
    const fecha_diseno = formData.get('fecha_diseno') as string;
    const fecha_fresado = formData.get('fecha_fresado') as string;
    const fecha_entrega = formData.get('fecha_entrega') as string;
    const sucursal = formData.get('sucursal') as string;
    const material = formData.get('material') as string;
    const diseno = formData.get('diseno') as string;
    const bloques_usados = formData.get('bloques_usados') as string;
    const asunto_detalles = formData.get('asunto_detalles') as string;

    await db.registros.create({
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
      },
    });

    revalidatePath('/');
    return { success: true, identificador };
  } catch (error: any) {
    console.error("Error in createRegistro Server Action:", error);
    return { success: false, error: error.message || "Error al crear el registro" };
  }
}

export async function updateRegistro(identificador: number, formData: FormData) {
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;
  // Remove empty strings and nulls
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null && v !== ''));

  await db.registros.update({
    where: { identificador },
    data: cleanData,
  });

  revalidatePath('/');
  return { success: true };
}

export async function deleteRegistro(identificador: number) {
  await db.registros.delete({
    where: { identificador },
  });

  revalidatePath('/');
  return { success: true };
}

export async function getNextId() {
  const max = await db.registros.aggregate({
    _max: {
      identificador: true,
    },
  });
  return (max._max.identificador || 0) + 1;
}

export async function getRegistros() {
  return await db.registros.findMany({
    orderBy: {
      identificador: 'desc',
    },
  });
}

const OPTIONS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'options.json');

export async function getDynamicOptions() {
  try {
    const fileContent = await fs.readFile(OPTIONS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading dynamic options, using backup:", error);
    return {
      estado: ["Solicitado", "En progreso", "Aceptado", "Entregado", "Fresado", "Diseñado", "Listo"],
      doctor: ["Grace Martinson", "Pauline Heinriksen", "David Sandoval", "Antonio Alvear", "Sebastián Ortíz", "Antonia Pardo"],
      tons_a_cargo: ["Sasha U.", "Natalia A.", "Martina T.", "Valentina S.", "Javiera P.", "Álvaro M.", "Isidora Q.", "Carolina H.", "Carolina S.", "SIN TONS", "Antonio Alvear", "TONS Tribunales", "Dr(a)"],
      sucursal: ["Sucursal Los Tribunales", "Sucursal Vitacura"],
      material: ["Disilicato A3", "Hibrido A3", "Híbrido A2", "Disilicato A2", "Disilicato A1", "Disilicato", "Híbrido A1", "PMMA"],
      diseno: ["Modalidad Chairside", "Diseñado por David", "Diseñado por Pauline", "Diseñado por Antonio", "Diseñado por Grace", "Diseñado por Sebastian"],
      bloques_usados: ["1 bloque", "2 bloques", "3 bloques", "4 bloques", "5 o más bloques"]
    };
  }
}

export async function updateDynamicOptions(options: any) {
  try {
    await fs.writeFile(OPTIONS_FILE_PATH, JSON.stringify(options, null, 2), 'utf-8');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error writing dynamic options:", error);
    return { success: false, error: "No se pudo guardar el archivo" };
  }
}

export async function addDynamicOption(category: string, value: string) {
  try {
    const options = await getDynamicOptions();
    if (options[category] && !options[category].includes(value)) {
      options[category].push(value);
      const writeRes = await updateDynamicOptions(options);
      if (!writeRes.success) {
        return { success: false, error: writeRes.error, options };
      }
    }
    return { success: true, options };
  } catch (err: any) {
    console.error("Error in addDynamicOption:", err);
    return { success: false, error: err.message || "Error desconocido", options: null };
  }
}

export async function removeDynamicOption(category: string, value: string) {
  try {
    const options = await getDynamicOptions();
    if (options[category]) {
      options[category] = options[category].filter((v: string) => v !== value);
      const writeRes = await updateDynamicOptions(options);
      if (!writeRes.success) {
        return { success: false, error: writeRes.error, options };
      }
    }
    return { success: true, options };
  } catch (err: any) {
    console.error("Error in removeDynamicOption:", err);
    return { success: false, error: err.message || "Error desconocido", options: null };
  }
}

export async function editDynamicOption(category: string, oldValue: string, newValue: string) {
  try {
    const options = await getDynamicOptions();
    if (options[category]) {
      options[category] = options[category].map((v: string) => v === oldValue ? newValue : v);
      const writeRes = await updateDynamicOptions(options);
      if (!writeRes.success) {
        return { success: false, error: writeRes.error, options };
      }
    }
    return { success: true, options };
  } catch (err: any) {
    console.error("Error in editDynamicOption:", err);
    return { success: false, error: err.message || "Error desconocido", options: null };
  }
}
