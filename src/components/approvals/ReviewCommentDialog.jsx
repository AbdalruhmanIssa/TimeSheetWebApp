import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { ReviewSchema } from "../../validations/schemas";
import FormError from "../common/FormError";

// reject and reopen both need a comment that the employee will read
function ReviewCommentDialog({ open, title, description, confirmLabel, loading, serverError, onSubmit, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(ReviewSchema), defaultValues: { comment: "" } });

  useEffect(() => {
    if (open) reset({ comment: "" });
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && (
          <DialogContentText component="div" sx={{ mb: 2 }}>
            {description}
          </DialogContentText>
        )}
        <FormError message={serverError} />
        <form id="review-comment-form" onSubmit={handleSubmit(({ comment }) => onSubmit(comment.trim()))} noValidate>
          <TextField
            label="Comment for the employee"
            placeholder="Say what needs to change"
            multiline
            minRows={3}
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
            {...register("comment")}
            error={!!errors.comment}
            helperText={errors.comment?.message}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" form="review-comment-form" variant="contained" color="error" loading={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewCommentDialog;
