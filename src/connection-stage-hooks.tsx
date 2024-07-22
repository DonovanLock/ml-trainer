import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ConnectionStageActions } from "./connection-stage-actions";
import { useLogging } from "./logging/logging-hooks";
import { ConnectActions } from "./connect-actions";
import { useNavigate } from "react-router";

export enum ConnectionFlowType {
  Bluetooth = "bluetooth",
  RadioBridge = "bridge",
  RadioRemote = "remote",
}

export enum ConnectionStatus {
  None = "None", // Have not been connected before
  Connecting = "Connecting",
  Connected = "Connected",
  Disconnected = "Disconnected",
  Reconnecting = "Reconnecting",
}

export type ConnectionType = "bluetooth" | "radio";

export interface ConnectionStage {
  // For connection flow
  flowStep: ConnectionFlowStep;
  flowType: ConnectionFlowType;
  // Number of times there have been consecutive reconnect fails
  // for determining which reconnection dialog to show
  reconnectFailStreak: number;

  // Connection details
  // Detected device id may not be synced with micro:bit name if the user changes
  // the bluetooth pattern, because it is not possible to compute device id from
  // micro:bit name
  detectedDeviceIds: number[];
  microbitNames: string[];
  status: ConnectionStatus;
  connType: ConnectionType;

  // Compatibility
  isWebBluetoothSupported: boolean;
  isWebUsbSupported: boolean;
}

export enum ConnectionFlowStep {
  // Happy flow stages
  None = "None",
  Start = "Start",
  ConnectCable = "ConnectCable",
  WebUsbFlashingTutorial = "WebUsbFlashingTutorial",
  ManualFlashingTutorial = "ManualFlashingTutorial",
  ConnectBattery = "ConnectBattery",
  EnterBluetoothPattern = "EnterBluetoothPattern",
  ConnectBluetoothTutorial = "ConnectBluetoothTutorial",

  // Stages that are not user-controlled
  WebUsbChooseMicrobit = "WebUsbChooseMicrobit",
  ConnectingBluetooth = "ConnectingBluetooth",
  ConnectingMicrobits = "ConnectingMicrobits",
  FlashingInProgress = "FlashingInProgress",

  // Failure stages
  TryAgainReplugMicrobit = "TryAgainReplugMicrobit",
  TryAgainCloseTabs = "TryAgainCloseTabs",
  TryAgainSelectMicrobit = "TryAgainSelectMicrobit",
  TryAgainBluetoothConnect = "TryAgainBluetoothConnect",
  BadFirmware = "BadFirmware",
  MicrobitUnsupported = "MicrobitUnsupported",
  WebUsbBluetoothUnsupported = "WebUsbBluetoothUnsupported",

  ReconnectAutoFail = "ReconnectAutoFail",
  ReconnectManualFail = "ReconnectManualFail",
  ReconnectFailedTwice = "ReconnectFailedTwice",
}

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
  ConnectBattery,

  // Web USB Flashing failure events
  TryAgainReplugMicrobit,
  TryAgainCloseTabs,
  TryAgainSelectMicrobit,
  InstructManualFlashing,
  BadFirmware,
  MicrobitUnsupported,

  // Bluetooth connection event
  ConnectingBluetooth,

  // Connecting microbits for radio connection
  ConnectingMicrobits,

  // Connection failure event
  ConnectFailed,
  ReconnectAutoFail,
  ReconnectManualFail,
  ReconnectFailedTwice,
}

type ConnectionStageContextValue = [
  ConnectionStage,
  (state: ConnectionStage) => void
];

export const ConnectionStageContext =
  createContext<ConnectionStageContextValue | null>(null);

interface ConnectionStageProviderProps {
  children: ReactNode;
}

const initialConnectionStageValue: ConnectionStage = {
  flowStep: ConnectionFlowStep.None,
  flowType: ConnectionFlowType.Bluetooth,
  reconnectFailStreak: 0,
  detectedDeviceIds: [],
  microbitNames: [],
  status: ConnectionStatus.None,
  connType: "bluetooth",
  isWebBluetoothSupported: true,
  isWebUsbSupported: true,
};

export const ConnectionStageProvider = ({
  children,
}: ConnectionStageProviderProps) => {
  const connectionStageContextValue = useState<ConnectionStage>(
    initialConnectionStageValue
  );
  return (
    <ConnectionStageContext.Provider value={connectionStageContextValue}>
      {children}
    </ConnectionStageContext.Provider>
  );
};

export const useConnectionStage = (): {
  stage: ConnectionStage;
  actions: ConnectionStageActions;
  isConnected: boolean;
} => {
  const connectionStageContextValue = useContext(ConnectionStageContext);
  if (!connectionStageContextValue) {
    throw new Error("Missing provider");
  }
  const [stage, setStage] = connectionStageContextValue;
  const logging = useLogging();
  const navigate = useNavigate();

  const actions = useMemo(() => {
    const connectActions = new ConnectActions(logging);
    return new ConnectionStageActions(
      connectActions,
      navigate,
      stage,
      setStage
    );
  }, [logging, navigate, stage, setStage]);

  useEffect(() => {
    console.log(stage);
  }, [stage]);

  const isConnected = useMemo(
    () => stage.status === ConnectionStatus.Connected,
    [stage.status]
  );

  return {
    stage,
    actions,
    isConnected,
  };
};
