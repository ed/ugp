import React, {Component} from 'react';
import { PropTypes } from 'prop-types'
import { newRoom } from '../actions';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class CreateRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomName: '',
      private: true,
      roomNameError: ''
    };
  }

  createRoom() {
    if (this.formValid()){
      let roomData = {
        name: this.state.roomName,
        visibility: this.state.private ? 'private' : 'public'
      }

      this.props.dispatch(newRoom(roomData))
    }
  }

  _onChange(e) {
    let roomName = e.target.value.slice(0,12);
    this.setState({ roomName }, () => this.setRoomError());
  }

  formValid() {
    return this.state.private || this.roomNameValid();
  }

  setRoomError() {
    let roomName = this.state.roomName;
    if (!this.state.private) {
      if (roomName.length < 1) {
        this.setState({ roomNameError: 'Please enter a room name.'});
      }
      else if (roomName.search(/\./) > -1) {
        this.setState({ roomNameError: 'Names cannot contain periods'});
      }
      else if (roomName.search(' ') > -1) {
        this.setState({ roomNameError: 'Names cannot contain spaces'});
      }
      else if (roomName.toLowerCase() != roomName) {
        this.setState({ roomNameError: 'Names must be lowercase'});
      }
      else if (roomName in this.props.rooms) {
        this.setState({ roomNameError: `\"${roomName}\" is already taken by a public room`});
      }
      else {
        this.setState({ roomNameError: ''});
      }
    }
  }

  roomNameValid() {
    let roomName = this.state.roomName;
    return !(roomName.length < 1 || roomName.search(/\./) > -1 || roomName.search(' ') > -1 || roomName.toLowerCase() != roomName || roomName in this.props.rooms);
  }

  _onKeyDown(e) {
    if (e.keyCode === 13) {
      this.createRoom();
      e.preventDefault();
    }
    if (e.keyCode === 27) this.props.close();
  }

  switchPublicPrivate() {
    this.setState({
      private: !this.state.private
    })
  }

  render() {
    let textBoxStyle = { };
    if (this.state.roomNameError.length > 1) {
      textBoxStyle.borderColor = 'orange';
    }
    let buttonActive = this.formValid();
    return (
        <div className="container" style={{userSelect: 'none'}}>
        <h1 style={{marginBottom: '10px', fontWeight:'bold'}}>Create a room</h1>
        <div style={{marginBottom: '12px', fontSize:'80%', color:'#c1c1c1'}}> Rooms can be public or private. Create a private room to play with friends or a public room to meet some new ones! </div>
        <label className="switch">
        <input className="switch-input" type="checkbox" checked={this.state.private} onChange={() => this.switchPublicPrivate()} />
        <span className="switch-label" data-on="Private" data-off="Public"></span>
        <span className="switch-handle"></span>
        </label>
        {this.state.private ? null :
         <div >
         <span style={{paddingBottom: '10px', fontWeight:'bold', color:'#464646'}}> Name </span>
         <i style={{paddingBottom: '10px', fontSize:'80%', fontWeight:'bold', color:'orange'}}>   {this.state.roomNameError} </i>
         <textarea autoFocus={true} onBlur={() => this.setRoomError()} spellCheck={false} className="message-composer data-box" style={textBoxStyle} value={this.state.roomName} onChange={(e) => this._onChange(e)} onKeyDown={(e) => this._onKeyDown(e)}/>
         <div style={{marginBottom: '12px', fontSize:'70%', color:'#c1c1c1'}}> Names must be lowercase, with no spaces or periods. </div>
         </div>
	       }
        <button className={`myButton${buttonActive ? ' active' : ''}`} onClick={() => this.createRoom()}>Create Room</button>
        <div > or <Link onClick={() => this.setState({private: true})} to="/browse">join a public room </Link></div>
        </div>
    );
  }
}

CreateRoom.contextTypes = {
  router: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    rooms: state.root.rooms.rooms
  }
}

export default connect(
  mapStateToProps
)(CreateRoom)
