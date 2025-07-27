import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check session
    const user = sessionStorage.getItem('user');
    if (user) navigate('/map');

    // Load Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: '679464120912-56tkuk1hlkt9ntullhgmmgec9snuh9cs.apps.googleusercontent.com',
        callback: handleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin'),
        { theme: 'outline', size: 'large' }
      );
    };

    return () => document.body.removeChild(script);
  }, []);

  const handleCallback = (response) => {
    const userObject = jwt_decode(response.credential);
    console.log(userObject); // You’ll see name, email, picture, etc.
  
    // Save the user in sessionStorage
    sessionStorage.setItem('user', JSON.stringify(userObject));
  
    // Navigate to map
    navigate('/map');
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center space-y-4">
        <h1 className="text-xl font-semibold">Sign in with Google</h1>
        <div id="google-signin" className="flex justify-center" />
      </div>
    </div>
  );
}
