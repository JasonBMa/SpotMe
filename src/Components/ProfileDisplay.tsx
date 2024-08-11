import React from 'react';

interface ProfileDisplay{
  display_name: String;
  email: String;
  followers: String;
}

function ProfileDisplay(props: ProfileDisplay) {
  return (
    <div>
      <h2>Profile</h2>
      <p>Display Name: {props.display_name} </p>
      <p>Email: {props.email}</p>
      {/* <p>Followers: {props.followers}</p> */}
      <h3>Playlists</h3>
      <p>Number of Playlists: </p>
    </div>
  );
}

export default ProfileDisplay;