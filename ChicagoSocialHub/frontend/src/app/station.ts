////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


export interface Station {
    id: String;
    stationName: String;
    availableBikes: Number;
    availableDocks: Number;
    is_renting: String;
    lastCommunicationTime: String;
    x_axis: Number[];
    latitude: Number;
    longitude: Number;
    status: String;
    totalDocks: Number;
    sma_30: Number;
    sma_720: Number;
    sma: ['30', '720'];
}
