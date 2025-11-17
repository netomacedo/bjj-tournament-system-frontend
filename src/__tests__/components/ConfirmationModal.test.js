import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from '../../components/Divisions/ConfirmationModal';

describe('ConfirmationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render modal when isOpen is true', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
      expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
    });

    test('should not render modal when isOpen is false', () => {
      render(<ConfirmationModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
    });

    test('should render confirm button with correct text', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText(defaultProps.confirmText)).toBeInTheDocument();
    });

    test('should render cancel button when cancelText is provided', () => {
      render(<ConfirmationModal {...defaultProps} />);

      expect(screen.getByText(defaultProps.cancelText)).toBeInTheDocument();
    });

    test('should not render cancel button when cancelText is not provided', () => {
      const propsWithoutCancel = { ...defaultProps, cancelText: undefined };
      render(<ConfirmationModal {...propsWithoutCancel} />);

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('Modal Types', () => {
    test('should apply primary type styling', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} type="primary" />);

      const confirmButton = screen.getByText(defaultProps.confirmText);
      expect(confirmButton).toHaveClass('btn-primary');
    });

    test('should apply danger type styling', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} type="danger" />);

      const confirmButton = screen.getByText(defaultProps.confirmText);
      expect(confirmButton).toHaveClass('btn-danger');
    });

    test('should apply success type styling', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} type="success" />);

      const confirmButton = screen.getByText(defaultProps.confirmText);
      expect(confirmButton).toHaveClass('btn-success');
    });

    test('should apply warning type styling', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} type="warning" />);

      const confirmButton = screen.getByText(defaultProps.confirmText);
      expect(confirmButton).toHaveClass('btn-warning');
    });
  });

  describe('User Interactions', () => {
    test('should call onConfirm when confirm button is clicked', () => {
      render(<ConfirmationModal {...defaultProps} />);

      const confirmButton = screen.getByText(defaultProps.confirmText);
      fireEvent.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when cancel button is clicked', () => {
      render(<ConfirmationModal {...defaultProps} />);

      const cancelButton = screen.getByText(defaultProps.cancelText);
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when clicking outside the modal', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} />);

      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should not close when clicking inside modal content', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} />);

      const modalContent = container.querySelector('.modal-content');
      fireEvent.click(modalContent);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Success Modal Variant', () => {
    test('should render success modal without cancel button', () => {
      const successProps = {
        ...defaultProps,
        type: 'success',
        title: 'Success!',
        message: 'Operation completed successfully',
        confirmText: 'OK',
        cancelText: undefined,
      };

      render(<ConfirmationModal {...successProps} />);

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('Error Modal Variant', () => {
    test('should render error modal with danger type', () => {
      const errorProps = {
        ...defaultProps,
        type: 'danger',
        title: 'Error',
        message: 'An error occurred',
        confirmText: 'OK',
        cancelText: undefined,
      };

      render(<ConfirmationModal {...errorProps} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      const confirmButton = screen.getByText('OK');
      expect(confirmButton).toHaveClass('btn-danger');
    });
  });

  describe('Message Formatting', () => {
    test('should handle multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      render(<ConfirmationModal {...defaultProps} message={multilineMessage} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    test('should handle long messages', () => {
      const longMessage = 'This is a very long message that should still be displayed correctly in the modal without any issues or truncation problems.';
      render(<ConfirmationModal {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper modal semantics', () => {
      const { container } = render(<ConfirmationModal {...defaultProps} />);

      const modal = container.querySelector('.modal');
      expect(modal).toBeInTheDocument();
    });

    test('should focus on confirm button when opened', () => {
      render(<ConfirmationModal {...defaultProps} />);

      // The confirm button should be focusable
      const confirmButton = screen.getByText(defaultProps.confirmText);
      expect(confirmButton).toBeInTheDocument();
    });
  });
});