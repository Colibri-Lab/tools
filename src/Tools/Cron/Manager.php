<?php

namespace App\Modules\Tools\Cron;
use Colibri\App;
use Colibri\IO\FileSystem\File;
use App\Modules\Tools\Models\Backup;


class Manager 
{

    private $_lines = [];
    
    public function __construct()
    {
        $this->_loadLines();
    }

    private function _loadLines() {

        $path = App::$appRoot . 'bin/';
        if(File::Exists($path . 'cron')) {
            $lines = File::Read($path . 'cron');
            $lines = explode("\n", $lines);
            foreach($lines as $line) {
                $line = preg_split('/\s+/', $line);
                $object = (object)[
                    'minute' => $line[0],
                    'hour' => $line[1],
                    'day' => $line[2],
                    'month' => $line[3],
                    'dayofweek' => $line[4],
                    'user' => $line[5]
                ];

                array_splice($line, 5);
                $command = implode(' ', $line);
                $object->command = $command;

                $this->_lines[] = $object;
            }
        }
        else {
            $this->_lines = [];
        }

    }

    private function _saveLines()
    {
        $path = App::$appRoot . 'bin/';
        $lines = [];
        foreach($this->_lines as $object) {
            $lines[] = $object->minute.' '.$object->hour.' '.$object->day.' '.$object->month.' '.$object->dayofweek.' '.$object->user.' '.$object->command;
        }

        File::Write($path . 'cron', implode("\n", $lines));

    }

    public function AddJob(Backup $job) 
    {
        $newJob = (object)[];
        $newJob->minute = $job->cron->minute->value;
        $newJob->hour = $job->cron->hour->value;
        $newJob->day = $job->cron->day->value;
        $newJob->month = $job->cron->month->value;
        $newJob->dayofweek = $job->cron->dayofweek->value;
        $newJob->user = 'root';
        $newJob->command = $job->command;
        $this->_lines[] = $newJob;
        $this->_saveLines();
    }

    public function RemoveJob(Backup $job) 
    {
        foreach($this->_lines as $index => $object) {

            if(
                $object->minute == $job->cron->minute->value &&
                $object->hour == $job->cron->hour->value && 
                $object->day == $job->cron->day->value &&
                $object->month == $job->cron->month->value &&
                $object->dayofweek == $job->cron->dayofweek->value &&
                $object->command == $job->command
            ) {
                unset($this->_lines[$index]);
                break;
            }

        }

        $this->_saveLines();
    }

}