import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { StationPopup } from './StationPopup'

const removeStationMock = jest.fn()
const addStationMock = jest.fn()

describe('StationPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the station name', async () => {
    render(
      <StationPopup
        addSite={() => {}}
        removeSite={() => {}}
        stationName="Bristol1"
        remove={true}
      />,
    )
    await waitFor(() => {
      expect(screen.getByTestId('station-name')).toBeInTheDocument()
      expect(screen.queryByTestId('station-name')).toHaveTextContent('Bristol1')
    })
  })

  it('renders the remove button', async () => {
    render(
      <StationPopup
        addSite={() => {}}
        removeSite={() => {}}
        stationName="Bristol1"
        remove={true}
      />,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('remove')).toBeInTheDocument()
      expect(screen.queryByTestId('add')).not.toBeInTheDocument()
    })
  })

  it('renders the add button', async () => {
    render(
      <StationPopup
        addSite={() => {}}
        removeSite={() => {}}
        stationName="Bristol1"
        remove={false}
      />,
    )
    await waitFor(() => {
      expect(screen.queryByTestId('add')).toBeInTheDocument()
      expect(screen.queryByTestId('remove')).not.toBeInTheDocument()
    })
  })

  it('remove function called on remove click', async () => {
    render(
      <StationPopup
        addSite={addStationMock}
        removeSite={removeStationMock}
        stationName="Bristol1"
        remove={true}
      />,
    )
    await waitFor(() => {
      const button = screen.getByTestId('remove')
      fireEvent.click(button)
      expect(removeStationMock).toHaveBeenCalled()
    })
  })

  it('add function called on add click', async () => {
    render(
      <StationPopup
        addSite={addStationMock}
        removeSite={removeStationMock}
        stationName="Bristol1"
        remove={false}
      />,
    )
    await waitFor(() => {
      const button = screen.getByTestId('add')
      fireEvent.click(button)
      expect(addStationMock).toHaveBeenCalled()
    })
  })
})
