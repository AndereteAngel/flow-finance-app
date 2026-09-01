// src/services/planService.js

import { generateInviteCode } from '../lib/utils';
import { supabase } from '../lib/supabase';

/**
 * Obtener todos los planes a los que pertenece el usuario actual.
 */
export async function getUserPlans() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Consulta los planes uniendo la tabla plan_members
    const { data, error } = await supabase
        .from('plan_members')
        .select(`
      role,
      plans (
        id,
        name,
        invite_code,
        owner_id,
        created_at
      )
    `)
        .eq('user_id', user.id);

    if (error) throw error;
    return data.map(item => ({ ...item.plans, userRole: item.role }));
}

/**
 * Crear un nuevo plan de presupuesto.
 * Agrega automáticamente al creador como 'owner' en plan_members.
 */
export async function createPlan(planName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const inviteCode = generateInviteCode();

    // 1. Insertar el plan
    const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
            name: planName,
            invite_code: inviteCode,
            owner_id: user.id
        })
        .select()
        .single();

    if (planError) throw planError;

    // 2. Registrar al usuario como creador (owner) en plan_members
    const { error: memberError } = await supabase
        .from('plan_members')
        .insert({
            plan_id: plan.id,
            user_id: user.id,
            role: 'owner'
        });

    if (memberError) throw memberError;

    return plan;
}

/**
 * Unirse a un plan existente mediante el código de invitación.
 */
export async function joinPlanByCode(inviteCode) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Buscar el plan por código de invitación
    const { data: plan, error: searchError } = await supabase
        .from('plans')
        .select('id, name')
        .eq('invite_code', cleanCode)
        .single();

    if (searchError || !plan) {
        throw new Error('Código de invitación inválido o no encontrado');
    }

    // 2. Insertar al usuario en plan_members como colaborador
    const { error: joinError } = await supabase
        .from('plan_members')
        .insert({
            plan_id: plan.id,
            user_id: user.id,
            role: 'collaborator'
        });

    if (joinError) {
        if (joinError.code === '23505') { // Violación de restricción UNIQUE
            throw new Error('Ya eres miembro de este presupuesto');
        }
        throw joinError;
    }

    return plan;
}