import { useNavigate } from 'react-router-dom';
import './App.css'

function Callback() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const domainName = import.meta.env.VITE_DOMAIN_NAME;
  //const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  const navigate = useNavigate();

  const redirectUri = domainName + "/Callback";

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code"); //gets code from url returned from Spotify OAuth
  console.log("Code: " + code);
  getAccessToken(clientId, code!)
    .then(() => {
      navigate("/Home");
    });

  async function getAccessToken(clientId: string, code: string){
    const verifier = localStorage.getItem("code_verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token, expires_in, refresh_token } = await result.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    let expirationTime = new Date().getTime() + expires_in * 1000;
    localStorage.setItem("expires_in", String(expirationTime));
}

  return (
    <>
    </>
  )
}

export default Callback