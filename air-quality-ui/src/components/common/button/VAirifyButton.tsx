import classes from './VAirifyButton.module.css'

interface Props {
  text: string
  onClick: () => void
  isButtonDisabled: boolean
}
export const VAirifyButton = (props: Props) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.isButtonDisabled}
      className={classes['vairify-button']}
    >
      {props.text}
    </button>
  )
}
