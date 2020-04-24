import numpy as np
import matplotlib.pyplot as plt

def getCSM(X, Y):
    XSqr = np.sum(X**2, 1)
    YSqr = np.sum(Y**2, 1)
    D = XSqr[:, None] + YSqr[None, :] - 2*X.dot(Y.T)
    D[D < 0] = 0
    D = np.sqrt(D)
    return D

def DTW(X, Y):
    D = getCSM(X, Y)
    M = D.shape[0]
    N = D.shape[1]
    S = np.zeros((M, N))
    B = np.zeros((M, N), dtype=int) # For backtracing
    step = [[-1, -1], [-1, 0], [0, -1]] # For backtracing
    S[:, 0] = np.cumsum(D[:, 0])
    S[0, :] = np.cumsum(D[0, :])
    B[:, 0] = 1
    B[0, :] = 2
    for i in range(1, M):
        for j in range(1, N):
            xs = [S[i-1, j-1], S[i-1, j], S[i, j-1]]
            idx = np.argmin(xs)
            S[i, j] = xs[idx] + D[i, j]
            B[i, j] = idx
    path = [[M-1, N-1]]
    i = M-1
    j = N-1
    while not(path[-1][0] == 0 and path[-1][1] == 0):
        s = step[B[i, j]]
        i += s[0]
        j += s[1]
        path.append([i, j])
    path.reverse()
    return {'D':D, 'S':S, 'B':B, 'path':path}
