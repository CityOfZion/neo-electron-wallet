// flow
import React, { Component } from 'react'

import styles from './CheckBox.scss'

type Props = {
  onChange: () => void,
  icon: React$Node,
  className?: string
}

type State = {
  checked: boolean
}

class CheckBox extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      checked: this.props.checked
    }
  }

  toggleCheckBox = () => {
    const { onChange } = this.props
    this.setState(prevState => ({ checked: !prevState.checked }), onChange)
  }

  render() {
    const { checked } = this.state
    const { icon, className } = this.props

    return (
      <button
        aria-checked={checked}
        onClick={this.toggleCheckBox}
        type="button"
        role="checkbox"
        className={`${styles.checkBox} ${className}`}
      >
        {checked && icon}
      </button>
    )
  }
}

export default CheckBox
