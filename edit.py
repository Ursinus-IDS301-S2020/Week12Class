#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import numpy as np

"""
Ex)

c  h  r  i  s. 
c  h  a  s  e. 

Way #3:
Match c to c: cost 0
Match h to h: cost 0
Match r to a: cost 1
Delete i: cost 1
Match s to s: cost 0
Delete e: cost 1 

Way #1:
Match c to c: cost 0
Match h to h: cost 0
Delete r: cost 1
Match i to a: cost 1
Match s to s: cost 0
Delete e: cost 1
Total cost: 3

Way #2:
match c to c
match h to h
match r to a (1)
match i to s (1)
match s to e (1)
Total cost: 3

dist("chris", "chris") = 0
dist("chris", "chase") > 0

1) Match characters.  If they're the same
   I don't pay a cost. If they're different
   pay a cost of 1
2) Delete a character at a cost of 1



Ex) school  fools

s  c  h  o  o  l.
f  o  o  l.  s

Delete s (cost 1)
Delete c (cost 1)
Match h to f (cost 1)
Match o to o 
Match o to o
Match l to l
Delete s (cost 1)
Cost 4



"""


"""
How to solve edit distance recursively

fib(n) = fib(n-1) + fib(n-2)

edit("chris", "chase") = min(
    1 + edit("chri", "chase"), // Deleted s from "chris"
    1 + edit("chris", "chas"), // Deleted e from "chase"
    1 + edit("chri", "chas") // Match e to s
    )
    
edit("chri", "chase") = min(
                         1 + edit("chr", "chase")
                         1 + edit("chri", "chas")
                         1 + edit("chr", "chas")
                         )
Stopping condition:
edit("", "chas")
edit("", s) = # characters in s

"""

count = 0

def edit_naive(a, b):
    global count
    count += 1
    result = -1
    if len(a) == 0:
        result = len(b)
    elif len(b) == 0:
        result = len(a)
    else:
        # Delete the last character from a
        cost1 = 1 + edit_naive(a[0:-1], b)
        # Delete the last character from b
        cost2 = 1 + edit_naive(a, b[0:-1])
        # Match the last character from a to last in b
        cost3 = 0 + edit_naive(a[0:-1], b[0:-1])
        if a[-1] != b[-1]:
            cost3 += 1
        result = min(cost1, cost2, cost3)
    return result

def edit(a, b, table):
    global count
    count += 1
    i = len(a)
    j = len(b)
    result = -1
    if table[i, j] == -1:
        if len(a) == 0:
            result = len(b)
        elif len(b) == 0:
            result = len(a)
        else:
            # Delete the last character from a
            cost1 = 1 + edit(a[0:-1], b, table)
            # Delete the last character from b
            cost2 = 1 + edit(a, b[0:-1], table)
            # Match the last character from a to last in b
            cost3 = 0 + edit(a[0:-1], b[0:-1], table)
            if a[-1] != b[-1]:
                cost3 += 1
            result = min(cost1, cost2, cost3)
        table[i, j] = result
    else:
        result = table[i, j]
    return result

def edit_iter(s1, s2):
    global count
    table = -1*np.ones((len(s1)+1, len(s2)+1))
    # Base cases / stopping conditions
    table[0, :] = np.arange(table.shape[1])
    table[:, 0] = np.arange(table.shape[0])
    for i in range(1, len(s1)+1): # Row
        for j in range(1, len(s2)+1): # Col
            count += 1
            cost = 0
            if s1[i-1] != s2[j-1]:
                cost = 1
            table[i, j] = min(table[i, j-1] + 1, # left 
                              table[i-1, j] + 1, # Up
                              table[i-1, j-1] + cost)
    print(table)
    # Return element in lower right corner for
    # the cost of matching the entire strings
    return table[-1, -1]

s1 = "schoolsch"
s2 = "foolsfoo"

edit_iter(s1, s2)


count = 0
print(edit_naive(s1, s2))
print("count = ", count)

count = 0
table = -np.ones((len(s1)+1, len(s2)+1))
print(edit(s1, s2, table))
print("count = ", count)

count = 0
print(edit_iter(s1, s2))
print("count = ", count)