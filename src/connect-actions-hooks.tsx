/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoardVersion,
  MicrobitRadioBridgeConnection,
  MicrobitWebBluetoothConnection,
  MicrobitWebUSBConnection,
} from "@microbit/microbit-connection";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ConnectActions } from "./connect-actions";
import { useLogging } from "./logging/logging-hooks";

interface ConnectContextValue {
  usb: MicrobitWebUSBConnection;
  bluetooth: MicrobitWebBluetoothConnection;
  radioBridge: MicrobitRadioBridgeConnection;
  radioRemoteBoardVersion: React.MutableRefObject<BoardVersion | undefined>;
}

const ConnectContext = createContext<ConnectContextValue | null>(null);

interface ConnectProviderProps {
  children: ReactNode;
  usb: MicrobitWebUSBConnection;
  bluetooth: MicrobitWebBluetoothConnection;
  radioBridge: MicrobitRadioBridgeConnection;
}

export const ConnectProvider = ({
  children,
  usb,
  bluetooth,
  radioBridge,
}: ConnectProviderProps) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      await usb.initialize();
      await bluetooth.initialize();
      await radioBridge.initialize();
      setIsInitialized(true);
    };
    if (!isInitialized) {
      void initialize();
    }
  }, [bluetooth, isInitialized, radioBridge, usb]);

  const radioRemoteBoardVersion = useRef<BoardVersion | undefined>();

  return (
    <ConnectContext.Provider
      value={{ usb, bluetooth, radioBridge, radioRemoteBoardVersion }}
    >
      {isInitialized ? children : <></>}
    </ConnectContext.Provider>
  );
};

export const useConnectActions = (): ConnectActions => {
  const connectContextValue = useContext(ConnectContext);
  if (!connectContextValue) {
    throw new Error("Missing provider");
  }
  const { usb, bluetooth, radioBridge, radioRemoteBoardVersion } =
    connectContextValue;
  const logging = useLogging();

  const connectActions = useMemo(
    () =>
      new ConnectActions(
        logging,
        usb,
        bluetooth,
        radioBridge,
        radioRemoteBoardVersion
      ),
    [bluetooth, logging, radioBridge, radioRemoteBoardVersion, usb]
  );

  return connectActions;
};
