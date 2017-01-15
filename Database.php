<?php
class Database extends PDO {
	/*
	*construct
	*CONECTION throughout Database
	*/
	function __construct($DB_TYPE, $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS){
		parent::__construct($DB_TYPE.':host='.$DB_HOST.';dbname='.$DB_NAME, $DB_USER, $DB_PASS, array(
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	}
     /*
    *SELECT
    *@param string $sql An sql string
    *@param array $array Parameters to bind
    *@param Constant $fetchMode A PDO Fetch Mode
    *@return mixed
   */
    public function select($sql, $array=array(), $fetchMode=PDO::FETCH_ASSOC){
      $stmt = $this->prepare($sql);
      $stmt->setFetchMode($fetchMode);
        foreach ($array as $key=>$value) {
         $stmt->bindValue("$key", $value);
         }
      $stmt->execute();
      $data = $stmt->fetchAll();
      return $data;
    }

    /*
    *Row Count
    *@param string $sql An sql string
    *@param array $array Parameters to bind
    *@param Constant $fetchMode A PDO Fetch Mode
    *@return mixed
   */
    public function countRow($sql, $array=array(), $fetchMode=PDO::FETCH_ASSOC){
        $stmt = $this->prepare($sql);
      $stmt->setFetchMode($fetchMode);
        foreach ($array as $key=>$value) {
         $stmt->bindValue("$key", $value);
      }
      $stmt->execute();
      $data = $stmt->rowCount();
      return $data;
    }

    /*
    *INSERT
    *@param string $tabe A name of table to insert into
    *@param string $data An associative array
   */
    public function insert($table, $data){
    	ksort($data);
    	//print_r($data);
    	$fieldNames = implode(', ', array_keys($data));
    	$fieldValues = ':' . implode(', :', array_keys($data));
    	$stmt = $this->prepare("INSERT INTO $table ($fieldNames) VALUES ($fieldValues)");
    	foreach ($data as $key => $value){
    		$stmt->bindValue(":$key", $value);
    	}
    	$stmt->execute();
    }

    /*
    *UPDATE
    *@param string $tabe a name of table to insert into
    *@param string $data an associative array
    *@param string $where The WHERE query part
   */
    public function update($table, $data, $where){
      ksort($data);
      $fieldDetails = NULL;
      foreach($data as $key => $value){
         $fieldDetails .="$key=:$key, ";
      }

     $fieldDetails = rtrim($fieldDetails, ', ');
     //echo $fieldDetails;
     $stmt = $this->prepare("UPDATE $table SET $fieldDetails WHERE $where");
     foreach($data as $key=>$value){
     	$stmt->bindValue(":$key", $value);
     }
     $stmt->execute();
    }

     /*
    *DELETE
    *@param string $tabe 
    *@param string $where An associative array
    *@param intenger $limit
    *@return intiger Affected Rows
   */
    public function delete($table, $where, $limit = 1){
      $stmt = $this->exec("DELETE FROM $table WHERE $where LIMIT $limit"); 
      return $stmt;
    }

    public function deleteGroup($table, $where){
      $stmt = $this->exec("DELETE FROM $table WHERE $where"); 
      return $stmt;
    }
}


?>