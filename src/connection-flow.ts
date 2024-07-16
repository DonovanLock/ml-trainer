import {
  BluetoothConn,
  Conn,
  ConnStage,
  ConnState,
  ConnStatus,
  ConnType,
  ProgramType,
} from "./connections";

export enum ConnEvent {
  // User triggered events
  Start,
  Switch,
  Next,
  Back,
  SkipFlashing,
  TryAgain,
  GoToBluetoothStart,
  Close,

  // Web USB Flashing events
  WebUsbChooseMicrobit,
  FlashingInProgress,
  FlashingComplete,

  // Web USB Flashing failure events
  TryAgainReplugMicrobit,
  TryAgainCloseTabs,
  TryAgainSelectMicrobit,
  InstructManualFlashing,
  BadFirmware,
  MicrobitUnsupported,

  // Bluetooth connection event
  ConnectingBluetooth,

  // Bluetooth connection failure event
  TryAgainBluetoothConnect,

  // Connecting microbits for radio connection
  ConnectingMicrobits,
}

type StageAndType = Pick<ConnState, "stage" | "type">;

export class ConnectionActions {
  constructor(
    private connState: ConnState,
    private setConnState: (state: ConnState) => void
  ) {}

  dispatchConnectFlowEvent = (event: ConnEvent) => {
    this.setConnState(dispatchConnFlowEvent(this.connState, event));
  };

  private setConn = (programType: ProgramType, conn: Conn) => {
    const { connections } = this.connState;
    // Replace existing conn or add as new conn depending on whether a conn
    // with the same programType already exists
    const connExists = !!connections.find((c) => c.program === programType);
    const newConnState = {
      ...this.connState,
      connections: connExists
        ? connections.map((c) => (c.program === programType ? conn : c))
        : [...connections, conn],
    };
    this.setConnState(newConnState);
  };

  setBluetoothConn = (conn: {
    status?: ConnStatus;
    bluetoothPattern: boolean[] | undefined;
  }) => {
    const newConn = {
      program: this.connState.program,
      status: ConnStatus.Disconnected,
      type: ConnType.Bluetooth,
      ...conn,
    };
    if (newConn.bluetoothPattern === undefined) {
      throw new Error("Bluetooth pattern missing");
    }
    this.setConn(this.connState.program, newConn as Conn);
  };

  getBluetoothPattern = () => {
    const conn = this.connState.connections.find(
      (c) =>
        c.program === this.connState.program && c.type === ConnType.Bluetooth
    ) as BluetoothConn | undefined;
    return conn ? conn.bluetoothPattern : undefined;
  };
}

export const dispatchConnFlowEvent = (state: ConnState, event: ConnEvent) => {
  switch (event) {
    case ConnEvent.Start:
      return {
        ...state,
        stage:
          !state.isWebBluetoothSupported && !state.isWebUsbSupported
            ? ConnStage.WebUsbBluetoothUnsupported
            : ConnStage.Start,
      };
    case ConnEvent.Close:
      return { ...state, stage: ConnStage.None };
    case ConnEvent.SkipFlashing:
      return { ...state, stage: ConnStage.ConnectBattery };
    case ConnEvent.FlashingInProgress:
      return { ...state, stage: ConnStage.FlashingInProgress };
    case ConnEvent.InstructManualFlashing:
      return { ...state, stage: ConnStage.ManualFlashingTutorial };
    case ConnEvent.WebUsbChooseMicrobit:
      return { ...state, stage: ConnStage.WebUsbChooseMicrobit };
    case ConnEvent.ConnectingBluetooth:
      return { ...state, stage: ConnStage.ConnectingBluetooth };
    case ConnEvent.ConnectingMicrobits:
      return { ...state, stage: ConnStage.ConnectingMicrobits };
    case ConnEvent.Next:
      return { ...state, ...getNextStageAndType(state, 1) };
    case ConnEvent.Back:
      return { ...state, ...getNextStageAndType(state, -1) };
    case ConnEvent.Switch:
      return {
        ...state,
        type:
          state.type === ConnType.Bluetooth
            ? ConnType.RadioRemote
            : ConnType.Bluetooth,
      };
    case ConnEvent.GoToBluetoothStart:
      return {
        ...state,
        stage: ConnStage.Start,
        type: ConnType.Bluetooth,
      };
    case ConnEvent.FlashingComplete:
      return {
        ...state,
        stage:
          state.type === ConnType.RadioRemote
            ? ConnStage.ConnectBattery
            : ConnStage.ConnectingMicrobits,
      };
    case ConnEvent.TryAgain:
      return {
        ...state,
        stage:
          state.stage === ConnStage.TryAgainBluetoothConnect
            ? ConnStage.ConnectBluetoothTutorial
            : ConnStage.ConnectCable,
      };
    default:
      return state;
  }
};

const getStageAndTypeOrder = (state: ConnState): StageAndType[] => {
  const { RadioRemote, RadioBridge, Bluetooth } = ConnType;
  if (state.type === ConnType.Bluetooth) {
    return [
      { stage: ConnStage.Start, type: Bluetooth },
      { stage: ConnStage.ConnectCable, type: Bluetooth },
      // Only bluetooth mode has this fallback, the radio bridge mode requires working WebUSB.
      !state.isWebUsbSupported ||
      state.stage === ConnStage.ManualFlashingTutorial
        ? { stage: ConnStage.ManualFlashingTutorial, type: Bluetooth }
        : { stage: ConnStage.WebUsbFlashingTutorial, type: Bluetooth },
      { stage: ConnStage.ConnectBattery, type: Bluetooth },
      { stage: ConnStage.EnterBluetoothPattern, type: Bluetooth },
      { stage: ConnStage.ConnectBluetoothTutorial, type: Bluetooth },
    ];
  }
  return [
    { stage: ConnStage.Start, type: RadioRemote },
    { stage: ConnStage.ConnectCable, type: RadioRemote },
    { stage: ConnStage.WebUsbFlashingTutorial, type: RadioRemote },
    { stage: ConnStage.ConnectBattery, type: RadioRemote },
    { stage: ConnStage.ConnectCable, type: RadioBridge },
    { stage: ConnStage.WebUsbFlashingTutorial, type: RadioBridge },
  ];
};

const getStageAndTypeIdx = (
  { stage, type }: StageAndType,
  order: StageAndType[]
) => {
  for (let idx = 0; idx < order.length; idx++) {
    const step = order[idx];
    if (step.stage === stage && step.type === type) {
      return idx;
    }
  }
  throw new Error("Should be able to match stage and type again order");
};

const getNextStageAndType = (state: ConnState, step: number): StageAndType => {
  const order = getStageAndTypeOrder(state);
  const curr = { stage: state.stage, type: state.type };
  const currIdx = getStageAndTypeIdx(curr, order);
  const newIdx = currIdx + step;
  // If impossible step stage, stick to current step
  if (newIdx === order.length || newIdx < 0) {
    return curr;
  }
  return order[newIdx];
};
