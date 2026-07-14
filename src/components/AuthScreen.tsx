import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, Leaf } from 'lucide-react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { loginSchema, registerSchema } from '@/lib/validations';
import { Particles } from '@/components/ui/particles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

type AuthMode = 'login' | 'register';
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthScreenProps {
  mode: AuthMode;
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, login, register } = useAuth();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = searchParams.get('from');
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'admin' ? '/admin/overview' : '/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);

  const handleLogin = async (data: LoginFormValues) => {
    setLoginLoading(true);
    const result = await login(data.email, data.password);
    setLoginLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Connexion réussie');
  };

  const handleRegister = async (data: RegisterFormValues) => {
    setRegisterLoading(true);
    const result = await register({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
    } as any);
    setRegisterLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.emailConfirmationSent) {
      setEmailSent(true);
      return;
    }

    toast.success('Inscription réussie');
  };

  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
      {/* Particles background — style efferd/auth-1 */}
      <Particles
        className="absolute inset-0"
        color="#888888"
        ease={20}
        quantity={120}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-8">
        {/* Bouton retour */}
        <Link
          to="/"
          className="absolute top-4 left-4 inline-flex items-center gap-1 whitespace-nowrap rounded-[min(var(--radius-md),12px)] px-2.5 py-1 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span>Accueil</span>
        </Link>

        <div className="mx-auto w-full space-y-6 sm:w-[360px]">
          {/* Logo */}
          <Logo className="h-6" />

          {emailSent ? (
            /* ── État email envoyé ── */
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Leaf className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Vérifiez votre email</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Un lien de confirmation a été envoyé à{' '}
                  <span className="font-medium text-foreground">
                    {registerForm.getValues('email')}
                  </span>
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  navigate('/login', { replace: true });
                }}
              >
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <>
              {/* ── Titre ── */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {mode === 'login'
                    ? 'Connectez-vous à votre espace Dugu Sugu.'
                    : 'Rejoignez la plateforme agricole du Mali.'}
                </p>
              </div>

              {/* ── Formulaire ── */}
              {mode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...loginForm.register('password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="default"
                    type="submit"
                    className="w-full bg-[#166534] text-white hover:bg-[#14532d]"
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Votre nom"
                      {...registerForm.register('full_name')}
                    />
                    {registerForm.formState.errors.full_name && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+223 xx xx xx xx"
                      {...registerForm.register('phone')}
                    />
                    {registerForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Min. 6 caractères"
                          {...registerForm.register('password')}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(prev => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirmation</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register('confirmPassword')}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#166534] text-white hover:bg-[#14532d]"
                    disabled={registerLoading}
                  >
                    {registerLoading ? 'Inscription...' : "S'inscrire"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Déjà un compte ?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      Se connecter
                    </Link>
                  </p>
                </form>
              )}

              {/* ── Mentions légales ── */}
              <p className="text-xs text-muted-foreground">
                En continuant, vous acceptez nos{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">
                  Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">
                  Politique de confidentialité
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
