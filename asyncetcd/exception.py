
import grpc

class GRPCException(Exception):
    pass

class GRPCAborted(GRPCException):
    status_code = grpc.StatusCode.ABORTED

class GRPCAlreadyExists(GRPCException):
    status_code = grpc.StatusCode.ALREADY_EXISTS

class GRPCCancelled(GRPCException):
    status_code = grpc.StatusCode.CANCELLED

class GRPCDataLoss(GRPCException):
    status_code = grpc.StatusCode.DATA_LOSS

class GRPCDeadlineExceeded(GRPCException):
    status_code = grpc.StatusCode.DEADLINE_EXCEEDED

class GRPCFailedPrecondition(GRPCException):
    status_code = grpc.StatusCode.FAILED_PRECONDITION

class GRPCInternal(GRPCException):
    status_code = grpc.StatusCode.INTERNAL

class GRPCInvalidArgument(GRPCException):
    status_code = grpc.StatusCode.INVALID_ARGUMENT

class GRPCNotFound(GRPCException):
    status_code = grpc.StatusCode.NOT_FOUND

class GRPCOk(GRPCException):
    status_code = grpc.StatusCode.OK

class GRPCOutOfRange(GRPCException):
    status_code = grpc.StatusCode.OUT_OF_RANGE

class GRPCPermissionDenied(GRPCException):
    status_code = grpc.StatusCode.PERMISSION_DENIED

class GRPCResourceExhausted(GRPCException):
    status_code = grpc.StatusCode.RESOURCE_EXHAUSTED

class GRPCUnauthenticated(GRPCException):
    status_code = grpc.StatusCode.UNAUTHENTICATED

class GRPCUnavailable(GRPCException):
    status_code = grpc.StatusCode.UNAVAILABLE

class GRPCUnimplemented(GRPCException):
    status_code = grpc.StatusCode.UNIMPLEMENTED

class GRPCUnknown(GRPCException):
    status_code = grpc.StatusCode.UNKNOWN


_grpc_exceptions = {
    c.status_code : c
    for c in [
        GRPCAborted, GRPCAlreadyExists, GRPCCancelled, GRPCDataLoss,
        GRPCDeadlineExceeded, GRPCFailedPrecondition, GRPCInternal,
        GRPCInvalidArgument, GRPCNotFound, GRPCOk, GRPCOutOfRange,
        GRPCPermissionDenied, GRPCResourceExhausted, GRPCUnauthenticated,
        GRPCUnavailable, GRPCUnimplemented, GRPCUnknown
    ]}
