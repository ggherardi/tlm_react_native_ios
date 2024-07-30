// custom icon renderer passed to iconRenderer prop 
// see the switch for possible icon name 

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

// values 
const MultiSelectIconComponent = ({ name, size = 18, style }: any) => {
  // flatten the styles 
  const flat = StyleSheet.flatten(style)
  // remove out the keys that aren't accepted on View 
  const { color, fontSize, ...styles } = flat

  let iconComponent
  // the colour in the url on this site has to be a hex w/o hash 
  const iconColor = color && color.substr(0, 1) === '#' ? `${color.substr(1)}/` : ''

  const Search = (
    <FontAwesomeIcon icon="search" />
  )
  const Down = (
    <FontAwesomeIcon icon="chevron-down" />
  )
  const Up = (
    <FontAwesomeIcon icon="chevron-up" />
  )
  const Close = (
    <FontAwesomeIcon icon="x" />
  )

  const Check = (
    <FontAwesomeIcon icon="check" />
  )
  const Cancel = (
    <FontAwesomeIcon icon="x" />
  )

  switch (name) {
    case 'search':
      iconComponent = Search
      break
    case 'keyboard-arrow-up':
      iconComponent = Up
      break
    case 'keyboard-arrow-down':
      iconComponent = Down
      break
    case 'close':
      iconComponent = Close
      break
    case 'check':
      iconComponent = Check
      break
    case 'cancel':
      iconComponent = Cancel
      break
    default:
      iconComponent = null
      break
  }
  return <View style={styles}>{iconComponent}</View>
}

export default MultiSelectIconComponent;