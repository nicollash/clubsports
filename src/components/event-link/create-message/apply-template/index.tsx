import React, { useEffect } from 'react';
import { Modal } from "components/common";
import { IMessageTemplate } from "common/models/event-link";

interface IApplyTemplatePopupProps {
  isOpen: boolean;
  templates: IMessageTemplate[];
  onClose: () => void;
  getTemplates: () => void;
};

const ApplyTemplatePopup = ({
  isOpen,
  templates,
  onClose,
  getTemplates,
}: IApplyTemplatePopupProps) => {

  useEffect(() => {
    getTemplates();
  }, []);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        {templates.map((temp: IMessageTemplate) => (
          <div>{temp.messageType}</div>
        ))}
      </div>
    </Modal>
  );
};

export default ApplyTemplatePopup;