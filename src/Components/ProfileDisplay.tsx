import '../ComponentsCSS/ProfileDisplay.css';
interface ProfileDisplay{
  profile_image: String;
  display_name: String;
  email: String;
  followers: String;
  product: String;
}

function ProfileDisplay(props: ProfileDisplay) {
  return (
    <div className="h-auto profileStats">
      <div style={{ display:"flex", alignItems:"end" }}>
        <img src={props.profile_image} className="rounded mr-1 h-auto" /><h2 className="m-0"><span className="spotifyGreenText">Pro</span>file</h2>
      </div>
      <p className="fw-light">
        <span className="fw-bold">Display Name:</span> {props.display_name}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Email:</span> {props.email}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Followers:</span> {props.followers}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Account Type:</span> {props.product}
      </p>
      <h3><span className="fw-bold spotifyGreenText">Play</span>lists</h3>
      <p className="fw-light">
        <span className="fw-bold">Number of Playlists:</span>
      </p>
    </div>
  );
}

export default ProfileDisplay;