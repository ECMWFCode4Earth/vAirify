interface StationPopupProps {
  title: string
  removeSite: (id: string) => void
}

export const StationPopup = (props: StationPopupProps) => {
  const handleRemoveClick = () => {
    props.removeSite(props.title)
  }

  return (
    <>
      <div>
        <div>{props.title}</div>
        <button onClick={handleRemoveClick}>Remove</button>
      </div>
    </>
  )
}
