import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie(request.cookies);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Fetch user from DB to get current estado and programa
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, usuario: true, nombre: true, cargo: true, estado: true, programa_id: true, programa: { select: { id: true, codigo: true, nombre: true, admin_ids: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // For transversal users (no programa_id in DB), use the programa from JWT session
    let programaId = user.programa?.id;
    let programaCodigo = user.programa?.codigo;
    let programaNombre = user.programa?.nombre;
    let isAdmin = user.programa?.admin_ids?.includes(user.usuario) || false;

    if (!user.programa_id && session.programa_id) {
      const sessionProg = await prisma.programa.findUnique({
        where: { id: session.programa_id },
        select: { id: true, codigo: true, nombre: true, admin_ids: true },
      });
      if (sessionProg) {
        programaId = sessionProg.id;
        programaCodigo = sessionProg.codigo;
        programaNombre = sessionProg.nombre;
        isAdmin = sessionProg.admin_ids?.includes(user.usuario) || false;
      }
    }

    return NextResponse.json(
      { id: user.id, usuario: user.usuario, nombre: user.nombre, cargo: user.cargo, estado: user.estado, programa_id: programaId, programa_codigo: programaCodigo, programa_nombre: programaNombre, is_admin: isAdmin },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
