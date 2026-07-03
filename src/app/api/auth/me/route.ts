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
      select: { id: true, usuario: true, nombre: true, cargo: true, estado: true, programa: { select: { id: true, codigo: true, nombre: true, admin_ids: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { id: user.id, usuario: user.usuario, nombre: user.nombre, cargo: user.cargo, estado: user.estado, programa_id: user.programa?.id, programa_codigo: user.programa?.codigo, programa_nombre: user.programa?.nombre, is_admin: user.programa?.admin_ids?.includes(user.usuario) || false },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
