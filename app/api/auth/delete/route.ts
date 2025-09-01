import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth-client';
import { usersService } from '@/modules/users/services/users-service';
import { authService } from '@/modules/auth/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the request body
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    await usersService.deleteUser(id);
    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      return NextResponse.json(
        { error: `Failed to delete user from Supabase Auth: ${authError.message}` },
        { status: 500 }
      );
    }

    // Delete user from GraphQL database

    // Sign out the user
    await authService.signOut();

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
