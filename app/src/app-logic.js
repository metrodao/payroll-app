import React, { useCallback, useMemo } from 'react'
import { AragonApi, useApi, useAppState } from '@aragon/api-react'
import appStateReducer from './app-state-reducer'
import { usePanelState } from './hooks/general-hooks'

// App actions
export function useEditEquityOptionAction(onDone) {
  const api = useApi()
  return useCallback(
    (equityMultiplier, vestingLength, vestingCliffLength) => {
      if (api) {
        api
          .setEquitySettings(
            equityMultiplier,
            vestingLength,
            vestingCliffLength,
            true
          )
          .toPromise()
        onDone()
      }
    },
    [api, onDone]
  )
}

export function useAddEmployeeAction(onDone) {
  const api = useApi()
  return useCallback(
    (accountAddress, initialSalaryPerSecond, startDateInSeconds, role) => {
      if (api) {
        api
          .addEmployee(
            accountAddress,
            initialSalaryPerSecond,
            startDateInSeconds,
            role
          )
          .toPromise()
        onDone()
      }
    },
    [api, onDone]
  )
}

export function usePaydayAction(onDone) {
  const api = useApi()
  return useCallback(
    (denominationTokenAllocation, requestedAmount, metadata) => {
      if (api) {
        api
          .payday(denominationTokenAllocation, requestedAmount, metadata)
          .toPromise()
        onDone()
      }
    },
    [api, onDone]
  )
}

// App panels
export function useAppPanels() {
  const addEmployeePanel = usePanelState()
  const editEquityOptionPanel = usePanelState()
  const requestSalaryPanel = usePanelState()

  return {
    editEquityOptionPanel: useMemo(
      () => ({
        ...editEquityOptionPanel,
        // ensure there is only one panel opened at a time
        visible:
          editEquityOptionPanel.visible &&
          !addEmployeePanel.visible &&
          !requestSalaryPanel.visible,
      }),
      [
        editEquityOptionPanel,
        addEmployeePanel.visible,
        requestSalaryPanel.visible,
      ]
    ),
    addEmployeePanel: useMemo(
      () => ({
        ...addEmployeePanel,
        // ensure there is only one panel opened at a time
        visible:
          addEmployeePanel.visible &&
          !editEquityOptionPanel.visible &&
          !requestSalaryPanel.visible,
      }),
      [
        addEmployeePanel,
        editEquityOptionPanel.visible,
        requestSalaryPanel.visible,
      ]
    ),
    requestSalaryPanel: useMemo(
      () => ({
        ...requestSalaryPanel,
        // ensure there is only one panel opened at a time
        visible:
          requestSalaryPanel.visible &&
          !editEquityOptionPanel.visible &&
          !addEmployeePanel.visible,
      }),
      [
        requestSalaryPanel,
        editEquityOptionPanel.visible,
        addEmployeePanel.visible,
      ]
    ),
  }
}

export function useAppLogic() {
  const { isSyncing } = useAppState()
  const {
    addEmployeePanel,
    editEquityOptionPanel,
    requestSalaryPanel,
  } = useAppPanels()

  const actions = {
    addEmployee: useAddEmployeeAction(addEmployeePanel.requestClose),
    editEquityOption: useEditEquityOptionAction(
      editEquityOptionPanel.requestClose
    ),
    payday: usePaydayAction(requestSalaryPanel.requestClose),
  }

  return {
    actions,
    panels: { addEmployeePanel, editEquityOptionPanel, requestSalaryPanel },
    isSyncing: isSyncing,
  }
}

export function AppLogicProvider({ children }) {
  return <AragonApi reducer={appStateReducer}>{children}</AragonApi>
}
