#!/usr/bin/env python
# Display a runtext with double-buffering.
from samplebase import SampleBase
from rgbmatrix import graphics
import time
import numpy as np
import datetime
import json
import math

class RunText(SampleBase):
    def __init__(self, *args, **kwargs):
        super(RunText, self).__init__(*args, **kwargs)
        self.parser.add_argument("-t", "--text", help="The text to scroll on the RGB LED panel", default="Hello world!")

    def run(self):
        # set up canvas
        offscreen_canvas = self.matrix.CreateFrameCanvas()

        # set up font
        font = graphics.Font()
######## font.LoadFont("./fonts/6x13.bdf")
        # fix this vvvvvvv
        # load font
#        font.LoadFont("../../../fonts/7x13.bdf")
        font.LoadFont("../../../../clock_production/fonts/6x13.bdf")
        textColor = graphics.Color(255, 255, 0)
        pos = 1
	ypos = 13

        #set text that displays
        my_text = self.args.text

        def add_zeros(time_unit, is_day=False):
            #make into string
            time_unit = str(time_unit)
            #all units besides days only need 2 digits
            if is_day:
                total_length = 3
            else:
                total_length = 2

            while len(time_unit) < total_length:
                time_unit = '0' + time_unit

            return time_unit


        def get_time_unit(time_val):
            time_val = abs(time_val)
            print("distance yday timeval", time_val)
            d = np.floor(time_val / (1000 * 60 * 60 * 24))
            d_in_ms = d * 86400000
            print("p", (time_val / (1000 * 60 * 60 * 24)))
            print("d", d)
            h = np.floor((time_val - d_in_ms) / (1000 * 60 * 60))
            h_in_ms = h * (86400000/24)

            m = np.floor((time_val - (d_in_ms + h_in_ms)) / (1000 * 60))
            m_in_ms = m * (60000)

            s = np.floor((time_val - (d_in_ms + h_in_ms + m_in_ms)) / (1000))
            d = add_zeros(math.trunc(abs(d)), True)
            h = add_zeros(math.trunc(abs(h)))
            m = add_zeros(math.trunc(abs(m)))
            s = add_zeros(math.trunc(abs(s)))

            return d, h, m, s




        ##### Date testing
        # day_length = (1000 * 60 * 60 * 24)
        print("get current date as YYYY-MM-DD")
        current_date = datetime.date.today().strftime('%Y-%m-%d')
        yesterday_date = (datetime.date.today() - datetime.timedelta(days = 1)).strftime('%Y-%m-%d')
        print(current_date)
        print(yesterday_date)

        print("get duration of today and day before")
        with open('../../../../clock_production/data/' + current_date + '.json') as f:
            data = json.load(f)

        print(data['durationLog'][current_date])
        print(data['durationLog'][yesterday_date])

#        unix_epoch_s = math.trunc(datetime.datetime.now().timestamp())
        unix_epoch_s = math.trunc(time.time())
        print("unix testing:")
        print(unix_epoch_s)

        unix_epoch_ms = unix_epoch_s * 1000
        day_length_s = 60 * 60 * 24
        day_length_ms = day_length_s * 1000


        unix_current_date = datetime.datetime.fromtimestamp(unix_epoch_s).strftime('%Y-%m-%d')
        unix_current_ms = unix_epoch_ms
        unix_yesterday_date = datetime.datetime.fromtimestamp(unix_epoch_s - (day_length_s)).strftime('%Y-%m-%d')
        unix_yesterday_ms = unix_epoch_ms - day_length_ms
        print("today :", unix_current_date)
        print("yesterday :", unix_yesterday_date)

        print("birthday : ", datetime.datetime.fromtimestamp(829298700).strftime('%Y-%m-%d'))
        birthdate_in_ms = 829298700 * 1000


        # # const timeAliveToday = today - birthdate
        timeAliveToday = unix_current_ms - birthdate_in_ms
        # # const timeAliveYesterday = yesterday - birthdate
        timeAliveYesterday = unix_yesterday_ms - birthdate_in_ms

        ### TEST CASES

        ## Case 1:
        print("should go from -1 day to +1 day in 1 minute")
        viewTimeToday = timeAliveToday + (day_length_ms * 2879)
        viewTimeYesterday = timeAliveYesterday - day_length_ms

        ## Case 2: 
        # print("should go backward from 10 days to 9 days at 1 tick/s")
        # viewTimeToday = timeAliveToday + (day_length_ms * 9)
        # viewTimeYesterday = timeAliveToday + (day_length_ms * 9)

        ### PRODUCTION USE
        # print("production time")
        # viewTimeToday = data['durationLog'][current_date]
        # viewTimeYesterday = data['durationLog'][yesterday_date]


        ######################################################################
        ######################################################################
        ######################################################################
        ######################################################################

	print("past test cases")
        distanceToday = viewTimeToday - timeAliveToday

        distanceYesterday = viewTimeYesterday - timeAliveYesterday

        # subtract distanceYesterday from distanceToday to get distanceMovement
        distanceMovement = distanceToday - distanceYesterday

        # stop any decimal funny business
        if distanceMovement < 1 and distanceMovement > -1:
            distanceMovement = 1


        # goal is to take a day to modify 'distanceYesterday' a 'distanceMovement' amount in increments of 1000

        # we can get how many increments of 1000 by dividing distanceMovement by 1000
	print(distanceMovement, "<- distancemovement")
        numIncrements = distanceMovement / 1000

        # stop any decimal funny business again 
        if numIncrements > -1 and numIncrements < 1:
            numIncrements = 1

	print("oast num increments", numIncrements)
        interval = abs((60 * 60 * 24) // numIncrements)
	
        msInterval = interval * 1000


        # 1 increment is 1s worth of ms
        increment = 1000
	print("before while loop, msInterval = ", msInterval, interval)
        # this to make the interval bigger is so we don't do a calc every ms, bigger itervals = good for performance
        while msInterval < 50:
#	    print("in while loop", msInterval)
            increment = increment * 2
            msInterval = msInterval * 2

        # rgb codes
        red = [255, 0, 0]
        green = [0, 255, 0]
	
	print("right before iterate")
        absNumIncrements = abs(numIncrements)
        def iterate(distanceYesterday, distanceMovement, msInterval, pos, ypos, offscreen_canvas):
            color = green if distanceYesterday > 0 else red
            distanceYesterday = distanceYesterday + increment if distanceMovement >= 0 else distanceYesterday - increment
            print("distance yesterday", distanceYesterday)
            d, h, m, s = get_time_unit(distanceYesterday)
	    
            my_text = str(d) +  ':' + str(h) +  ':' + str(m) + ':' + s
            print(color, d, ':', h, ':', m, ':', s)
	    print(my_text, "my_text")

            # original python stuff:
            offscreen_canvas.Clear()
            len = graphics.DrawText(offscreen_canvas, font, pos, ypos, textColor, my_text)
            time.sleep(msInterval / 1000)
            offscreen_canvas = self.matrix.SwapOnVSync(offscreen_canvas)

            # return
            return distanceYesterday

        while absNumIncrements > 1:
            distanceYesterday = iterate(distanceYesterday, distanceMovement, msInterval, pos, ypos, offscreen_canvas)
            absNumIncrements = absNumIncrements - 1
            print("increments left", math.trunc(numIncrements))

        # while True:
        #     offscreen_canvas.Clear()
        #     # fix text that displays
        #     len = graphics.DrawText(offscreen_canvas, font, pos, 10, textColor, my_text)

        #     time.sleep(0.05)
        #     offscreen_canvas = self.matrix.SwapOnVSync(offscreen_canvas)


# Main function
if __name__ == "__main__":
    run_text = RunText()
    if (not run_text.process()):
        run_text.print_help()








# ##########################################################
# ##########################################################
# #################  *** ORIGINAL FILE *** #################
# ##########################################################
# ##########################################################
# def add_zeros(time_unit, is_day=False):
#     #make into string
#     time_unit = str(time_unit)
#     #all units besides days only need 2 digits
#     if is_day:
#         total_length = 3
#     else:
#         total_length = 2

#     while len(time_unit) < total_length:
#         time_unit = '0' + time_unit

#     return time_unit


# def get_time_unit(time_val):
#     time_val = abs(time_val)
#     print("distance yday timeval", time_val)
#     d = np.floor(time_val / (1000 * 60 * 60 * 24))
#     d_in_ms = d * 86400000
#     print("p", (time_val / (1000 * 60 * 60 * 24)))
#     print("d", d)
#     h = np.floor((time_val - d_in_ms) / (1000 * 60 * 60))
#     h_in_ms = h * (86400000/24)

#     m = np.floor((time_val - (d_in_ms + h_in_ms)) / (1000 * 60))
#     m_in_ms = m * (60000)

#     s = np.floor((time_val - (d_in_ms + h_in_ms + m_in_ms)) / (1000))
#     d = add_zeros(math.trunc(abs(d)), True)
#     h = add_zeros(math.trunc(abs(h)))
#     m = add_zeros(math.trunc(abs(m)))
#     s = add_zeros(math.trunc(abs(s)))

#     return d, h, m, s




# ##### Date testing
# # day_length = (1000 * 60 * 60 * 24)
# print("get current date as YYYY-MM-DD")
# current_date = datetime.date.today().strftime('%Y-%m-%d')
# yesterday_date = (datetime.date.today() - datetime.timedelta(days = 1)).strftime('%Y-%m-%d')
# print(current_date)
# print(yesterday_date)

# print("get duration of today and day before")
# with open('./data/' + current_date + '.json') as f:
#   data = json.load(f)

# print(data['durationLog'][current_date])
# print(data['durationLog'][yesterday_date])

# unix_epoch_s = math.trunc(datetime.datetime.now().timestamp())
# print("unix testing:")
# print(unix_epoch_s)

# unix_epoch_ms = unix_epoch_s * 1000
# day_length_s = 60 * 60 * 24
# day_length_ms = day_length_s * 1000


# unix_current_date = datetime.datetime.fromtimestamp(unix_epoch_s).strftime('%Y-%m-%d')
# unix_current_ms = unix_epoch_ms
# unix_yesterday_date = datetime.datetime.fromtimestamp(unix_epoch_s - (day_length_s)).strftime('%Y-%m-%d')
# unix_yesterday_ms = unix_epoch_ms - day_length_ms
# print("today :", unix_current_date)
# print("yesterday :", unix_yesterday_date)

# print("birthday : ", datetime.datetime.fromtimestamp(829298700).strftime('%Y-%m-%d'))
# birthdate_in_ms = 829298700 * 1000


# # # const timeAliveToday = today - birthdate
# timeAliveToday = unix_current_ms - birthdate_in_ms
# # # const timeAliveYesterday = yesterday - birthdate
# timeAliveYesterday = unix_yesterday_ms - birthdate_in_ms

# ### TEST CASES

# ## Case 1:
# # print("should go from -1 day to +1 day in 1 minute")
# # viewTimeToday = timeAliveToday + (day_length_ms * 2879)
# # viewTimeYesterday = timeAliveYesterday - day_length_ms

# ## Case 2: 
# print("should go backward from 10 days to 9 days at 1 tick/s")
# viewTimeToday = timeAliveToday + (day_length_ms * 9)
# viewTimeYesterday = timeAliveToday + (day_length_ms * 9)

# ### PRODUCTION USE
# print("production time")
# viewTimeToday = data['durationLog'][current_date]
# viewTimeYesterday = data['durationLog'][yesterday_date]


# ######################################################################
# ######################################################################
# ######################################################################
# ######################################################################


# distanceToday = viewTimeToday - timeAliveToday

# distanceYesterday = viewTimeYesterday - timeAliveYesterday

# # subtract distanceYesterday from distanceToday to get distanceMovement
# distanceMovement = distanceToday - distanceYesterday

# # stop any decimal funny business
# if distanceMovement < 1 and distanceMovement > -1:
#     distanceMovement = 1


# # goal is to take a day to modify 'distanceYesterday' a 'distanceMovement' amount in increments of 1000

# # we can get how many increments of 1000 by dividing distanceMovement by 1000
# numIncrements = distanceMovement / 1000

# # stop any decimal funny business again 
# if numIncrements > -1 and numIncrements < 1:
#     numIncrements = 1

# interval = abs((60 * 60 * 24) / numIncrements)

# msInterval = interval * 1000


# # 1 increment is 1s worth of ms
# increment = 1000

# # this to make the interval bigger is so we don't do a calc every ms, bigger itervals = good for performance
# while msInterval < 50:
#     increment = increment * 2
#     msInterval = msInterval * 2

# # rgb codes
# red = [255, 0, 0]
# green = [0, 255, 0]


# absNumIncrements = abs(numIncrements)
# def iterate(distanceYesterday, distanceMovement, msInterval):
#     color = green if distanceYesterday > 0 else red
#     distanceYesterday = distanceYesterday + increment if distanceMovement >= 0 else distanceYesterday - increment
#     print("distance yesterday", distanceYesterday)
#     d, h, m, s = get_time_unit(distanceYesterday)

#     print(color, d, ':', h, ':', m, ':', s)
#     time.sleep(msInterval / 1000)
#     return distanceYesterday

# while absNumIncrements > 1:
#     distanceYesterday = iterate(distanceYesterday, distanceMovement, msInterval)
#     absNumIncrements = absNumIncrements - 1
#     print("increments left", math.trunc(numIncrements))


# ##################################
# ################# LETS TEST THINGS
# ##################################

# # ## Test if add_zeros is working
# # print("addZeros day test")
# # print("expect: 001")
# # print(add_zeros('1', True))
# # print("addZeros nonday test")
# # print("expect: 02")
# # print(add_zeros('2', False))

# # ## Test if getTimeUnit is working
# # print("getTimeUnit test")
# # print("expect: 1:0:1:1")
# # print(get_time_unit(19119500000 + 61000))

