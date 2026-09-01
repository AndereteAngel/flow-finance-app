// src/services/transactionService.js

import { supabase } from '../lib/supabase';

/**
 * Obtener los movimientos de un plan específico ordenados por fecha.
 */
export async function getTransactionsByPlan(planId) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Registrar un nuevo ingreso o gasto.
 */
export async function createTransaction({
    planId,
    description,
    amount,
    type
}) {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            plan_id: planId,
            description: description,
            amount: parseFloat(amount),
            type: type,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Editar una transacción existente.
 */
export async function updateTransaction(
    transactionId,
    {
        description,
        amount,
        type
    }
) {
    const { data, error } = await supabase
        .from('transactions')
        .update({
            description: description,
            amount: parseFloat(amount),
            type: type
        })
        .eq('id', transactionId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Eliminar una transacción.
 */
export async function deleteTransaction(transactionId) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) {
        throw error;
    }
}

/**
 * Suscribirse a cambios en tiempo real en la tabla transactions para un plan.
 */
export function subscribeToTransactions(planId, onUpdate) {
    const channel = supabase
        .channel(`realtime:transactions:${planId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: `plan_id=eq.${planId}`
            },
            () => {
                onUpdate();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}