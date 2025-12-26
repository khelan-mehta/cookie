import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { FiHeart } from "react-icons/fi";

import { authService } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../utils/constants";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError("Invalid Google response");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.googleAuth({
        idToken: credentialResponse.credential, // ✅ JWT ID TOKEN
      });

      if (response.registered && response.token && response.user) {
        login(response.token, response.user);

        navigate(
          response.user.role === "vet" ? ROUTES.VET_DASHBOARD : ROUTES.DASHBOARD
        );
      } else if (response.tempData) {
        navigate(ROUTES.ROLE_SELECT, {
          state: { tempData: response.tempData },
        });
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🐾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cookie</h1>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-1">
            Every life deserves a life <FiHeart className="text-rose-500" />
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Welcome
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError("Google sign-in failed. Please try again.")
              }
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          {isLoading && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Signing you in…
            </p>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Animal emergency? Help is just a tap away.
          </p>
        </div>
      </div>
    </div>
  );
};
