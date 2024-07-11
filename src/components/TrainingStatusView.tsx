import {
  Button,
  HStack,
  Heading,
  Progress,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router";
import { useGestureData } from "../gestures-hooks";
import { trainModel } from "../ml";
import { createStepPageUrl } from "../urls";
import TrainingButton from "./TrainingButton";
import TrainingErrorDialog from "./TrainingErrorDialog";
import { TrainingStatus, useTrainingStatus } from "../training-hook";

const TrainingStatusView = () => {
  const navigate = useNavigate();
  const [{ data }] = useGestureData();
  const [trainingStatus, setTrainingStatus] = useTrainingStatus();
  const [trainProgress, setTrainProgress] = useState<number>(0);
  const trainErrorDialog = useDisclosure();

  const navigateToDataPage = useCallback(() => {
    navigate(createStepPageUrl("add-data"));
  }, [navigate]);

  const navigateToTestModelPage = useCallback(() => {
    navigate(createStepPageUrl("test-model"));
  }, [navigate]);

  const handleTrain = useCallback(async () => {
    setTrainingStatus(TrainingStatus.InProgress);
    await trainModel({
      data,
      onTraining: (progress) => {
        setTrainProgress(progress);
      },
      onTrainEnd: () => {
        setTrainingStatus(TrainingStatus.Complete);
      },
      onError: () => {
        setTrainingStatus(TrainingStatus.NotStarted);
      },
    });
  }, [data, setTrainingStatus]);

  switch (trainingStatus) {
    case TrainingStatus.InsufficientData:
      return (
        <TrainingStatusSection
          statusId="menu.trainer.notEnoughDataHeader1"
          descriptionId="menu.trainer.notEnoughDataInfoBody"
        >
          <Button variant="primary" onClick={navigateToDataPage}>
            <FormattedMessage id="menu.trainer.addDataButton" />
          </Button>
        </TrainingStatusSection>
      );
    case TrainingStatus.NotStarted:
      return (
        <>
          <TrainingErrorDialog
            isOpen={trainErrorDialog.isOpen}
            onClose={trainErrorDialog.onClose}
          />
          <TrainingStatusSection statusId="content.trainer.enoughdata.title">
            <TrainingButton onClick={handleTrain} />
          </TrainingStatusSection>
        </>
      );
    case TrainingStatus.InProgress:
      return (
        <TrainingStatusSection statusId="content.trainer.training.title">
          <Progress
            colorScheme="green"
            value={trainProgress * 100}
            w="350px"
            rounded="full"
          />
        </TrainingStatusSection>
      );
    case TrainingStatus.Complete:
      return (
        <TrainingStatusSection statusId="menu.trainer.TrainingFinished">
          <HStack gap={10}>
            <Button variant="secondary" onClick={navigateToDataPage}>
              <FormattedMessage id="menu.trainer.addMoreDataButton" />
            </Button>
            <Button variant="primary" onClick={navigateToTestModelPage}>
              <FormattedMessage id="menu.trainer.testModelButton" />
            </Button>
          </HStack>
        </TrainingStatusSection>
      );
    case TrainingStatus.Retrain:
      return (
        <TrainingStatusSection statusId="content.trainer.retrain.title">
          <TrainingButton onClick={handleTrain} />
        </TrainingStatusSection>
      );
  }
};

interface TrainingStatusSectionProps {
  statusId: string;
  descriptionId?: string;
  children: ReactNode;
}

const TrainingStatusSection = ({
  statusId,
  descriptionId,
  children,
}: TrainingStatusSectionProps) => {
  return (
    <>
      <Heading as="h2" fontSize="lg" fontWeight="semibold">
        <FormattedMessage id={statusId} />
      </Heading>
      {descriptionId && (
        <Text>
          <FormattedMessage id={descriptionId} />
        </Text>
      )}
      {children}
    </>
  );
};

export default TrainingStatusView;
