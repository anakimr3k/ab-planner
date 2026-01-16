import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit que toutes les routes commençant par /dashboard sont protégées
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Si l'utilisateur essaie d'aller sur le dashboard sans être connecté, on le bloque
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Ignore les fichiers statiques (images, css...)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Toujours exécuter pour les routes API
    '/(api|trpc)(.*)',
  ],
};