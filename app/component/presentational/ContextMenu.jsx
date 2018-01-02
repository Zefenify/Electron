/* global window */
import React from 'react';
import { func, shape } from 'prop-types';
import styled from 'react-emotion';

import { CONTEXT_TRACK, CONTEXT_ALBUM, CONTEXT_ARTIST, CONTEXT_PLAYLIST } from '@app/redux/constant/contextMenu';
import { BASE_S3, BASE_SHARE } from '@app/config/api';

import Close from '@app/component/svg/Close';
import { ClearButton } from '@app/component/styled/Button';
import Divider from '@app/component/styled/Divider';

const ContextMenuContainer = styled.div`
  position: fixed;
  right: 0;
  top: 32px;
  bottom: 0;
  width: 250px;
  z-index: 999;
  overflow-y: scroll;
  background-color: ${props => props.theme.navbarBackground};
  color: ${props => props.theme.navbarTextActive};
  box-shadow: -2px 0 2px 0 ${props => props.theme.navBarBoxShadow};
  transform: translate3d(264px, 0, 0);
  transition: transform 256ms;
  will-change: transform;

  &.context-menu-active {
    transform: translate3d(0, 0, 0);
    will-change: transform, filter, opacity;
  }

  display: flex;
  padding: 1em 0;
  flex-direction: column;

  .close-SVG-container {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    padding-left: 1em;
    padding-top: 1em;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .title {
    flex: 0 0 auto;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.85em;
    margin-bottom: 16px;
    text-align: center;
    font-weight: bold;
    padding-left: calc(40px + 1em);
    color: ${props => props.theme.listDividerText};

    &:after {
      height: 0;
      content: '';
      flex: 1 1 auto;
      border-top: 1px solid ${props => props.theme.listDivider};
    }
  }

  .link {
    flex: 0 0 auto;
    text-decoration: none;
    padding: 1rem;
    color: ${props => props.theme.navbarText};

    &:not([disabled]):hover {
      background-color: ${props => props.theme.controlBackground};
      color: ${props => props.theme.navbarTextActive};
    }

    &[disabled] {
      color: ${props => props.theme.listDividerText};
    }
  }

  .track,
  .album,
  .artist,
  .playlist {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 1em;
    padding: 0 1rem;
    flex: 0 0 auto;

    & > * {
      margin: 0;
    }

    &__artist-image {
      width: 164px;
      height: 164px;
      border-radius: 50%;
      border: 1px solid ${props => props.theme.listDivider};
      margin-bottom: 0.75em;
    }

    &__playlist-image,
    &__album-image {
      width: 164px;
      height: 164px;
      border-radius: 6px;
      border: 1px solid ${props => props.theme.listDivider};
      margin-bottom: 0.75em;
    }

    &__name {
      text-align: center;
      font-size: 1.25em;
      margin-bottom: 0.25em;
    }

    &__album {
      text-align: center;
      color: ${props => props.theme.navbarText};
    }
  }
`;

const ContextMenu = ({
  contextMenu,
  user,
  song,
  closeContextMenu,
  history,
  songSave,
  songRemove,
}) => {
  if (contextMenu === null) {
    return (
      <ContextMenuContainer id="context-menu-container">
        <ClearButton className="close-SVG-container" onClick={closeContextMenu}>
          <Close />
        </ClearButton>
      </ContextMenuContainer>
    );
  }

  const { type, payload } = contextMenu;
  let trackSaved = false;

  if (song !== null && type === CONTEXT_TRACK) {
    const savedTracks = song.data.song_track;
    const trackId = payload.track_id;
    trackSaved = savedTracks.includes(trackId);
  }

  switch (type) {
    case CONTEXT_TRACK:
      return (
        <ContextMenuContainer id="context-menu-container">
          <ClearButton className="close-SVG-container" onClick={closeContextMenu}>
            <Close />
          </ClearButton>

          <div className="title">TRACK&nbsp;</div>

          <div className="track">
            <div className="track__album-image" style={{ background: `transparent url('${BASE_S3}${payload.track_album.album_cover.s3_name}') 50% 50% / cover no-repeat` }} />
            <p className="track__name">{ payload.track_name }</p>
            <p className="track__album">{ payload.track_album.album_name }</p>
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Artist&nbsp;</Divider>
          <div>
            { payload.track_album.album_artist.map(artist => (<ClearButton className="link" disabled={`/artist/${artist.artist_id}` === history.location.pathname} onClick={() => { closeContextMenu(); history.push(`/artist/${artist.artist_id}`); }}>{ artist.artist_name }</ClearButton>)) }
            { payload.track_featuring.map(artist => (<ClearButton className="link" disabled={`/artist/${artist.artist_id}` === history.location.pathname} onClick={() => { closeContextMenu(); history.push(`/artist/${artist.artist_id}`); }}>{ artist.artist_name }</ClearButton>)) }
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Album&nbsp;</Divider>
          <ClearButton className="link" disabled={`/album/${payload.track_album.album_id}` === history.location.pathname} onClick={() => { closeContextMenu(); history.push(`/album/${payload.track_album.album_id}`); }}>Go to Album</ClearButton>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Your Library&nbsp;</Divider>
          {
            trackSaved
              ? <ClearButton className="link" disabled={user === null} onClick={() => { closeContextMenu(); songRemove(payload); }}>Remove from Your Library</ClearButton>
              : <ClearButton className="link" disabled={user === null} onClick={() => { closeContextMenu(); songSave(payload); }}>Save to Your Library</ClearButton>
          }

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Share&nbsp;</Divider>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://www.facebook.com/sharer.php?u=${BASE_SHARE}album/${payload.track_album.album_id}/${payload.track_id}`); }} className="link">Facebook</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://twitter.com/intent/tweet?url=${BASE_SHARE}album/${payload.track_album.album_id}/${payload.track_id}&text=${payload.track_name}`); }} className="link">Twitter</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://telegram.me/share/url?url=${BASE_SHARE}album/${payload.track_album.album_id}/${payload.track_id}&text=${payload.track_name}`); }} className="link">Telegram</ClearButton>
        </ContextMenuContainer>
      );

    case CONTEXT_ALBUM:
      return (
        <ContextMenuContainer id="context-menu-container">
          <ClearButton className="close-SVG-container" onClick={closeContextMenu}>
            <Close />
          </ClearButton>

          <div className="title">ALBUM&nbsp;</div>

          <div className="album">
            <div className="album__album-image" style={{ background: `transparent url('${BASE_S3}${payload.album_cover.s3_name}') 50% 50% / cover no-repeat` }} />
            <p className="album__name">{ payload.album_name }</p>
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Artist&nbsp;</Divider>
          <div>
            { payload.album_artist.map(artist => (<ClearButton className="link" disabled={`/artist/${artist.artist_id}` === history.location.pathname} onClick={() => { closeContextMenu(); history.push(`/artist/${artist.artist_id}`); }}>{ artist.artist_name }</ClearButton>)) }
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Album&nbsp;</Divider>
          <ClearButton className="link" disabled={`/album/${payload.album_id}` === history.location.pathname} onClick={() => { closeContextMenu(); history.push(`/album/${payload.album_id}`); }}>Go to Album</ClearButton>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Share&nbsp;</Divider>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://www.facebook.com/sharer.php?u=${BASE_SHARE}album/${payload.album_id}`); }} className="link">Facebook</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://twitter.com/intent/tweet?url=${BASE_SHARE}album/${payload.album_id}&text=${payload.album_name}`); }} className="link">Twitter</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://telegram.me/share/url?url=${BASE_SHARE}album/${payload.album_id}&text=${payload.album_name}`); }} className="link">Telegram</ClearButton>
        </ContextMenuContainer>
      );

    case CONTEXT_ARTIST:
      return (
        <ContextMenuContainer id="context-menu-container">
          <ClearButton className="close-SVG-container" onClick={closeContextMenu}>
            <Close />
          </ClearButton>

          <div className="title">ARTIST&nbsp;</div>

          <div className="artist">
            <div className="artist__artist-image" style={{ background: `transparent url('${BASE_S3}${payload.artist_cover.s3_name}') 50% 50% / cover no-repeat` }} />
            <p className="artist__name">{ payload.artist_name }</p>
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Share&nbsp;</Divider>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://www.facebook.com/sharer.php?u=${BASE_SHARE}artist/${payload.artist_id}`); }} className="link">Facebook</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://twitter.com/intent/tweet?url=${BASE_SHARE}artist/${payload.artist_id}&text=${payload.artist_name}`); }} className="link">Twitter</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://telegram.me/share/url?url=${BASE_SHARE}artist/${payload.artist_id}&text=${payload.artist_name}`); }} className="link">Telegram</ClearButton>
        </ContextMenuContainer>
      );

    case CONTEXT_PLAYLIST:
      return (
        <ContextMenuContainer id="context-menu-container">
          <ClearButton className="close-SVG-container" onClick={closeContextMenu}>
            <Close />
          </ClearButton>

          <div className="title">PLAYLIST&nbsp;</div>

          <div className="playlist">
            <div className="playlist__playlist-image" style={{ background: `transparent url('${BASE_S3}${payload.playlist_cover.s3_name}') 50% 50% / cover no-repeat` }} />
            <p className="playlist__name">{ payload.playlist_name }</p>
          </div>

          <Divider padding="0 0 0 1rem" fontSize="0.8em">Share&nbsp;</Divider>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://www.facebook.com/sharer.php?u=${BASE_SHARE}playlist/${payload.playlist_id}`); }} className="link">Facebook</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://twitter.com/intent/tweet?url=${BASE_SHARE}playlist/${payload.playlist_id}&text=${payload.playlist_name}`); }} className="link">Twitter</ClearButton>
          <ClearButton onClick={() => { closeContextMenu(); window.ELECTRON.shell.openExternal(`https://telegram.me/share/url?url=${BASE_SHARE}playlist/${payload.playlist_id}&text=${payload.playlist_name}`); }} className="link">Telegram</ClearButton>
        </ContextMenuContainer>
      );

    default:
      return null;
  }
};

ContextMenu.propTypes = {
  contextMenu: shape({}),
  user: shape({}),
  song: shape({}),
  history: shape({}),
  closeContextMenu: func.isRequired,
  songSave: func.isRequired,
  songRemove: func.isRequired,
};

ContextMenu.defaultProps = {
  contextMenu: null,
  user: null,
  song: null,
  history: null,
};

module.exports = ContextMenu;
