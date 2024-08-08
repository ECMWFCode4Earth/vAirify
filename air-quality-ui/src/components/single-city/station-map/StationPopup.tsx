interface StationPopupProps {
  stationName: string
  remove: boolean
  removeSite: (id: string) => void
  addSite: (id: string) => void
}

export const StationPopup = (props: StationPopupProps) => {
  const handleRemoveClick = () => {
    props.removeSite(props.stationName)
  }

  const handleAddClick = () => {
    props.addSite(props.stationName)
  }

  return (
    <>
      <div data-testid="station-name">{props.stationName}</div>
      {props.remove && (
        <button onClick={handleRemoveClick} data-testid="remove">
          Remove
        </button>
      )}
      {!props.remove && (
        <button onClick={handleAddClick} data-testid="add">
          Add
        </button>
      )}
    </>
  )
}
