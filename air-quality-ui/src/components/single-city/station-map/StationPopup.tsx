interface StationPopupProps {
  title: string
  remove: boolean
  removeSite: (id: string) => void
  addSite: (id: string) => void
}

export const StationPopup = (props: StationPopupProps) => {
  const handleRemoveClick = () => {
    props.removeSite(props.title)
  }

  const handleAddClick = () => {
    props.addSite(props.title)
  }

  return (
    <>
      <div>
        <div>{props.title}</div>
        {props.remove && <button onClick={handleRemoveClick}>Remove</button>}
        {!props.remove && <button onClick={handleAddClick}>Add</button>}
      </div>
    </>
  )
}
