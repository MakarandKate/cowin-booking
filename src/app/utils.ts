export class Util{
    public static getDate(){
        let tDate=new Date();
        let dd:any=tDate.getDate();
        let mm:any=tDate.getMonth()+1;
        let yy=tDate.getFullYear();
        if(dd<10){
            dd="0"+dd;
        }
        if(mm<10){
            mm="0"+mm;
        }
        return dd+"-"+mm+"-"+yy;
    }
}