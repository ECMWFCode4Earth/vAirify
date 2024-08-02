import { Button } from '@mui/material'
import './VAirifyButton.css'

interface Props {
  text: string
  onClick: () => void
  isButtonDisabled: boolean
}
export const VAirifyButton = (props: Props) => {
  return (
    <Button
      onClick={props.onClick}
      disabled={props.isButtonDisabled}
      className={'vairify-button'}
    >
      {props.text}
    </Button>
  )
}
