import NextAuth from 'next-auth';
import * as authLib from '@/lib/auth';

const handler = NextAuth((authLib as any).authOptions ?? (authLib as any).default ?? {});

export { handler as GET, handler as POST };
