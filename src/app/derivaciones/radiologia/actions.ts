'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getRadiologiaDerivacionesRegistros() {
  try {
    return await db.radiologia_derivaciones.findMany({
      where: {
        AND: [
          { nombre: { not: null } },
          { nombre: { not: '' } }
        ]
      },
      orderBy: {
        id: 'desc',
      },
    });
  } catch (error: any) {
    console.error("Error in getRadiologiaDerivacionesRegistros:", error);
    throw new Error(error.message || "Error al obtener registros de radiología de derivaciones");
  }
}

export async function createRadiologiaDerivacionRegistro(formData: any) {
  try {
    const data = {
      rut: formData.rut || null,
      nombre: formData.nombre || null,
      apellido_paterno: formData.apellido_paterno || null,
      apellido_materno: formData.apellido_materno || null,
      edad: formData.edad ? parseInt(formData.edad, 10) : null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      doctor: formData.doctor || null,
      especialidad: formData.especialidad || null,
      dg_clinico: formData.dg_clinico || null,
      sucursal: formData.sucursal || null,
      observaciones: formData.observaciones || null,
      fecha_toma_examen: formData.fecha_toma_examen || null,
      observaciones_operador: formData.observaciones_operador || null,
      rx_panoramica: formData.rx_panoramica ? parseInt(formData.rx_panoramica, 10) : null,
      analisis_cefalometrico: formData.analisis_cefalometrico ? parseInt(formData.analisis_cefalometrico, 10) : null,
      teleradiografia: formData.teleradiografia ? parseInt(formData.teleradiografia, 10) : null,
      tomografia_atm: formData.tomografia_atm ? parseInt(formData.tomografia_atm, 10) : null,
      tomografia_grupo_pieza: formData.tomografia_grupo_pieza ? parseInt(formData.tomografia_grupo_pieza, 10) : null,
      tomografia_arcada: formData.tomografia_arcada ? parseInt(formData.tomografia_arcada, 10) : null,
      tomografia_total: formData.tomografia_total ? parseInt(formData.tomografia_total, 10) : null,
      rx_retroalveolar_total: formData.rx_retroalveolar_total ? parseInt(formData.rx_retroalveolar_total, 10) : null,
      rx_mano: formData.rx_mano ? parseInt(formData.rx_mano, 10) : null,
      bitewing_bilateral: formData.bitewing_bilateral ? parseInt(formData.bitewing_bilateral, 10) : null,
      fecha_entrega: formData.fecha_entrega || null,
      radiologo_responsable: formData.radiologo_responsable || null,
      proceso: formData.proceso || 'PENDIENTE',
      correo: formData.correo || null,
    };

    const newRecord = await db.radiologia_derivaciones.create({
      data,
    });

    revalidatePath('/derivaciones/radiologia');
    return { success: true, record: newRecord };
  } catch (error: any) {
    console.error("Error in createRadiologiaDerivacionRegistro:", error);
    return { success: false, error: error.message || "Error al crear el registro de radiología de derivaciones" };
  }
}

export async function updateRadiologiaDerivacionRegistro(id: number | string, formData: any) {
  try {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(parsedId)) {
      throw new Error("ID inválido");
    }

    const data = {
      rut: formData.rut || null,
      nombre: formData.nombre || null,
      apellido_paterno: formData.apellido_paterno || null,
      apellido_materno: formData.apellido_materno || null,
      edad: formData.edad ? parseInt(formData.edad, 10) : null,
      fecha_nacimiento: formData.fecha_nacimiento || null,
      doctor: formData.doctor || null,
      especialidad: formData.especialidad || null,
      dg_clinico: formData.dg_clinico || null,
      sucursal: formData.sucursal || null,
      observaciones: formData.observaciones || null,
      fecha_toma_examen: formData.fecha_toma_examen || null,
      observaciones_operador: formData.observaciones_operador || null,
      rx_panoramica: formData.rx_panoramica ? parseInt(formData.rx_panoramica, 10) : null,
      analisis_cefalometrico: formData.analisis_cefalometrico ? parseInt(formData.analisis_cefalometrico, 10) : null,
      teleradiografia: formData.teleradiografia ? parseInt(formData.teleradiografia, 10) : null,
      tomografia_atm: formData.tomografia_atm ? parseInt(formData.tomografia_atm, 10) : null,
      tomografia_grupo_pieza: formData.tomografia_grupo_pieza ? parseInt(formData.tomografia_grupo_pieza, 10) : null,
      tomografia_arcada: formData.tomografia_arcada ? parseInt(formData.tomografia_arcada, 10) : null,
      tomografia_total: formData.tomografia_total ? parseInt(formData.tomografia_total, 10) : null,
      rx_retroalveolar_total: formData.rx_retroalveolar_total ? parseInt(formData.rx_retroalveolar_total, 10) : null,
      rx_mano: formData.rx_mano ? parseInt(formData.rx_mano, 10) : null,
      bitewing_bilateral: formData.bitewing_bilateral ? parseInt(formData.bitewing_bilateral, 10) : null,
      fecha_entrega: formData.fecha_entrega || null,
      radiologo_responsable: formData.radiologo_responsable || null,
      proceso: formData.proceso || null,
      correo: formData.correo || null,
    };

    const updated = await db.radiologia_derivaciones.update({
      where: { id: parsedId },
      data,
    });

    revalidatePath('/derivaciones/radiologia');
    return { success: true, record: updated };
  } catch (error: any) {
    console.error("Error in updateRadiologiaDerivacionRegistro:", error);
    return { success: false, error: error.message || "Error al actualizar el registro de radiología de derivaciones" };
  }
}

export async function deleteRadiologiaDerivacionRegistro(id: number | string) {
  try {
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(parsedId)) {
      throw new Error("ID inválido");
    }

    await db.radiologia_derivaciones.delete({
      where: { id: parsedId },
    });

    revalidatePath('/derivaciones/radiologia');
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteRadiologiaDerivacionRegistro:", error);
    return { success: false, error: error.message || "Error al eliminar el registro de radiología de derivaciones" };
  }
}
