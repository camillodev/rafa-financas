
import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Riqueza em Dia</CardTitle>
          <CardDescription>
            Entre na sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn
            appearance={{
              elements: {
                card: "shadow-none",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerAction: "text-primary"
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta? <Link to="/sign-up" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;
