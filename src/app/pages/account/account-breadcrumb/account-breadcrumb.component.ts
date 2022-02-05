import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-account-breadcrumb',
  templateUrl: './account-breadcrumb.component.html',
  styleUrls: ['./account-breadcrumb.component.css']
})
export class AccountBreadcrumbComponent implements OnInit {

  displayName:string;

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {

      /*=======================================
        Validar si existe usuario autenticado 180
      ========================================*/
      this.usersService.authActivate().then(resp =>{

         if(resp){

              
               this.usersService.getFilterData("idToken", localStorage.getItem("idToken"))
               .subscribe(resp=>{

                  for(const i in resp){

                    this.displayName = resp[i].displayName;

                  }
                })
             }
           })
  }

  /*=======================================
        Salir del sistema 180
      ========================================*/

  logout(){

    localStorage.removeItem('idToken');
    localStorage.removeItem('expiresIn');
    window.open('login', '_top')
  }

}
