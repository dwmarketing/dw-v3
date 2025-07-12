import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
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