
import React from 'react';
import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Riqueza em Dia</CardTitle>
          <CardDescription>
            Crie sua conta para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp
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
            Já tem uma conta? <Link to="/sign-in" className="text-primary hover:underline">Entrar</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpPage;
