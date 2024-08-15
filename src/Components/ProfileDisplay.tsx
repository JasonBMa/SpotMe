import '../ComponentsCSS/ProfileDisplay.css';
interface ProfileDisplay{
  display_name: String;
  email: String;
  followers: String;
}

function ProfileDisplay(props: ProfileDisplay) {
  return (
    <div className="h-auto profileStats">
      <h2 className=""><span className="spotifyGreenText">Pro</span>file</h2>
      <p className="fw-light">
        <span className="fw-bold">Display Name:</span> {props.display_name}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Email:</span> {props.email}
      </p>
      <p className="fw-light">
        <span className="fw-bold">Followers:</span> {props.followers}
      </p>
      <h3><span className="fw-bold spotifyGreenText">Play</span>lists</h3>
      <p className="fw-light">
        <span className="fw-bold">Number of Playlists:</span>
      </p>
    </div>
  );
}

export default ProfileDisplay;