import React, { Component } from 'react'
import {
  whoami,
  addNotification,
  dismissNotification,
  setTempUserInfo
} from '../actions'
import { connect } from 'react-redux'
import { NotificationStack } from 'react-notification'
import { push } from 'react-router-redux'
import Popover from './PopoverSmall'
import Spinner from './Spinner'

class Container extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false
    }
  }

  render() {
    const { roomStatus, user, cookie, error } = this.props
    const { isFetching } = this.state
    let popoverContent = null
    return !isFetching ? (
      <div className="container">
        <NotificationStack
          notifications={this.props.notifications.toArray()}
          onDismiss={(notification) =>
            this.props.dispatch(dismissNotification(notification))
          }
          dismissInOrder={false}
          barStyleFactory={(ind, style) => {
            return {
              ...style,
              WebKittransition: '',
              MozTransition: '',
              msTransition: '',
              OTransition: '',
              transition: '',
              WebkitTransform: 'translatez(0)',
              MozTransform: 'translatez(0)',
              msTransform: 'translatez(0)',
              OTransform: 'translatez(0)',
              transform: 'translatez(0)',
              fontFamily: 'Lato',
              background: '#f2777a',
              borderWidth: '0px',
              height: '30px',
              color: 'white',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: `${4 + ind * 5}rem`,
              transition: 'all .8s ease-in-out',
              opacity: 0,
              right: '-100%',
              left: ''
            }
          }}
          activeBarStyleFactory={(ind, style) => {
            return {
              ...style,
              left: '',
              right: '15px',
              top: `${4 + ind * 5}rem`,
              opacity: 1,
              boxShadow: '2px 2px 5px -1px rgba(0,0,0,0.39)'
            }
          }}
        />
        <Popover isOpen={this.props.openModal !== 'NONE'}>
          {popoverContent}
        </Popover>
        {this.props.children}
      </div>
    ) : (
      <Spinner />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    openModal: state.root.modals.openModal,
    notifications: state.root.notifications,
    user: state.root.user,
    cookie: state.root.cookie,
    authStatus: state.root.auth.status,
    roomStatus: state.root.rooms.isValid
  }
}

export default connect(mapStateToProps)(Container)
