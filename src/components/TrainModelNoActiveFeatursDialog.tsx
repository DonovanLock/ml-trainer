import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { ComponentProps } from "react";
import { FormattedMessage } from "react-intl";

const TrainModelNoActiveFeaturesDialog = ({
  onClose,
  ...rest
}: Omit<ComponentProps<typeof Modal>, "children">) => {
  return (
    <Modal
      closeOnOverlayClick={false}
      motionPreset="none"
      size="lg"
      isCentered
      onClose={onClose}
      {...rest}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <FormattedMessage id="No Features are active" />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              <FormattedMessage id="You need to have at least one of the features active to train the model" />
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="flex-end">
            <Button variant="primary" onClick={onClose}>
              <FormattedMessage id="close-action" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default TrainModelNoActiveFeaturesDialog;
