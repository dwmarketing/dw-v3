import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Don't render auth forms if user is already authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }
  return <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <img src="/lovable-uploads/85422dbf-ef79-4fba-96e3-bbdb6e14bdc7.png" alt="DN Marketing" className="h-64 w-auto mx-auto mb-2" />
        </div>
        
        {isLogin ? <LoginForm onSwitchToSignUp={() => setIsLogin(false)} /> : <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />}
      </div>
    </div>;
};
export default Auth;