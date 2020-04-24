import numpy as np
import scipy.io as sio
import matplotlib.pyplot as plt
import pyrubberband as pyrb
import librosa
from DTW import *


hop = 1024
x1, sr = librosa.load("lincoln1.mp3")
X1 = librosa.feature.mfcc(y=x1, sr=sr, hop_length=hop, htk=True).T
x2, sr = librosa.load("lincoln2.mp3")
X2 = librosa.feature.mfcc(y=x2, sr=sr, hop_length=hop, htk=True).T

ysync_bad = np.zeros((x2.size, 2))
ysync_bad[0:x1.size, 0] = x1
ysync_bad[:, 1] = x2
sio.wavfile.write("sync_bad.wav", sr, ysync_bad)


res = DTW(X1, X2)
D, path = res['D'], res['path']
indices = []
for i in range(D.shape[0]):
    indices.append([])
for p in path:
    indices[p[0]].append(p[1])
x2sync = []
for i, js in enumerate(indices):
    j1 = min(js)
    j2 = max(js)
    k = j2-j1+1
    print(i, k)
    if k > 1:
        x = x2[hop*j1:hop*(j2+1)]
        x = pyrb.time_stretch(x, sr, k)
        x2sync += x.tolist()
    elif k == 1:
        x = x2[hop*j1:hop*(j2+1)]
        x2sync += x.tolist()
x2sync = np.array(x2sync)

y = np.zeros((x1.size, 2))
y[:, 0] = x1
y[0:x2sync.size, 1] = x2sync

sio.wavfile.write("sync.wav", sr, y)

